import mongoose, { Document, Schema } from 'mongoose';

export interface IMegaMenuSection {
  name: string;
  items: {
    name: string;
    href: string;
  }[];
}

export interface IMegaMenuBrand {
  name: string;
  imageUrl: string;
  href: string;
}

export interface IMegaMenuCategory {
  id: string;
  name: string;
  href: string;
  sidebar: IMegaMenuSection[];
  brands: IMegaMenuBrand[];
}

export interface IMegaMenuDocument extends Document {
  categories: IMegaMenuCategory[];
}

const megaMenuSchema = new Schema<IMegaMenuDocument>({
  categories: [{
    id: String,
    name: String,
    href: String,
    sidebar: [{
      name: String,
      items: [{
        name: String,
        href: String
      }]
    }],
    brands: [{
      name: String,
      imageUrl: String,
      href: String
    }]
  }]
}, { timestamps: true });

const MegaMenu = mongoose.model<IMegaMenuDocument>('megamenu', megaMenuSchema);
export default MegaMenu;
