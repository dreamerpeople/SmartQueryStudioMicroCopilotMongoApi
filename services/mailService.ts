import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { exec } from "child_process";
import * as XLSX from "xlsx";
import dotenv from "dotenv";

dotenv.config();

const MAIL_STRATEGY = process.env.MAIL_STRATEGY || "DESKTOP";

const createSmtpTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.office365.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });
};

const sendViaDesktop = async (
  to: string,
  subject: string,
  htmlBody: string,
  attachmentPath?: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(
      __dirname,
      "../scripts/sendOutlookDesktop.ps1",
    );
    const escapedBody = htmlBody.replace(/"/g, '""');
    const escapedAttachment = attachmentPath
      ? attachmentPath.replace(/"/g, '""')
      : undefined;
    let command = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}" -to "${to}" -subject "${subject}" -body "${escapedBody}"`;
    if (escapedAttachment) {
      command += ` -attachment "${escapedAttachment}"`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("[MailService Desktop Error]", stderr);
        return reject(
          new Error(`Desktop Mail Error: ${stderr || error.message}`),
        );
      }
      console.log("[MailService Desktop Success]", stdout);
      resolve(stdout);
    });
  });
};

const createExcelAttachment = async (
  data: any,
  filenamePrefix = "report",
): Promise<string> => {
  const rows = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? [data]
      : [];

  const normalizedRows = rows.map((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      return row;
    }
    return { value: row };
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(normalizedRows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const safePrefix = filenamePrefix
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 50);
  const tempFileName = `${safePrefix}-${Date.now()}.xlsx`;
  const tempFilePath = path.join(os.tmpdir(), tempFileName);
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  await fs.writeFile(tempFilePath, buffer);
  return tempFilePath;
};

type MailOptions = {
  to: string;
  subject: string;
  template: string;
  data: any;
  attachmentPath?: string;
};

class MailService {
  static async createExcelAttachment(
    data: any,
    filenamePrefix = "report",
  ): Promise<string> {
    return createExcelAttachment(data, filenamePrefix);
  }

  static async sendMail({
    to,
    subject,
    template,
    data,
    attachmentPath,
  }: MailOptions): Promise<any> {
    if (!to) throw new Error("Recipient email is required.");

    try {
      const templatePath = path.join(__dirname, `../templates/${template}.ejs`);
      const html = (await ejs.renderFile(templatePath, data)) as string;

      if (MAIL_STRATEGY === "SMTP") {
        const transporter = createSmtpTransporter();
        const mailOptions: any = {
          from: process.env.DEFAULT_FROM_EMAIL || process.env.SMTP_USER,
          to,
          subject,
          html,
        };
        if (attachmentPath) {
          mailOptions.attachments = [
            {
              filename: path.basename(attachmentPath),
              path: attachmentPath,
            },
          ];
        }
        const info = (await transporter.sendMail(mailOptions)) as any;
        console.log("[MailService SMTP Success]", info.messageId);
        if (attachmentPath && attachmentPath.startsWith(os.tmpdir())) {
          await fs.unlink(attachmentPath).catch(() => undefined);
        }
        return info;
      }

      console.log("[MailService] Using Desktop Strategy");
      const result = await sendViaDesktop(to, subject, html, attachmentPath);
      if (attachmentPath && attachmentPath.startsWith(os.tmpdir())) {
        await fs.unlink(attachmentPath).catch(() => undefined);
      }
      return result;
    } catch (error: any) {
      console.error("[MailService Error]", error.message);
      throw error;
    }
  }
}

export default MailService;
