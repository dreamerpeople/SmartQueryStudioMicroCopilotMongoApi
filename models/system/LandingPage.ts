import mongoose, { Document, Schema } from 'mongoose';

export interface ButtonConfig {
  text: string;
  link: string;
}

export interface BannerConfig {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  button?: ButtonConfig;
  backgroundColor?: string;
  enabled: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  primaryButton: ButtonConfig;
  secondaryButton: ButtonConfig;
  backgroundImage: string;
  backgroundVideo?: string;
  sideBanners: BannerConfig[];
}

export interface HeroSection {
  slides: HeroSlide[];
  overlayOpacity: number;
  textColor: 'light' | 'dark';
  alignment: 'left' | 'center' | 'right';
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  link: string;
  enabled: boolean;
}

export interface CategoryRow {
  title: string;
  items: CategoryItem[];
  enabled: boolean;
}

export interface ProductSection {
  id: string;
  title: string;
  type: 'trending' | 'popular' | 'new-arrivals' | 'featured';
  limit: number;
  enabled: boolean;
}

export interface LandingPageSettings {
  hero: HeroSection;
  categories: CategoryRow;
  productSections: ProductSection[];
  middleBanner: BannerConfig;
  bottomBanner: BannerConfig;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

export interface ILandingPageDocument extends LandingPageSettings, Document {}

const ButtonSchema = new Schema({
  text: String,
  link: String,
}, { _id: false });

const BannerSchema = new Schema({
  id: String,
  title: String,
  subtitle: String,
  description: String,
  image: String,
  button: ButtonSchema,
  backgroundColor: String,
  enabled: { type: Boolean, default: true },
}, { _id: false });

const HeroSlideSchema = new Schema({
  id: String,
  title: String,
  subtitle: String,
  description: String,
  primaryButton: ButtonSchema,
  secondaryButton: ButtonSchema,
  backgroundImage: String,
  backgroundVideo: String,
  sideBanners: [BannerSchema],
}, { _id: false });

const landingPageSchema = new Schema<ILandingPageDocument>({
  hero: {
    slides: [HeroSlideSchema],
    overlayOpacity: { type: Number, default: 0.5 },
    textColor: { type: String, enum: ['light', 'dark'], default: 'light' },
    alignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
  },
  categories: {
    title: String,
    items: [{
      id: String,
      name: String,
      icon: String,
      link: String,
      enabled: { type: Boolean, default: true },
    }],
    enabled: { type: Boolean, default: true },
  },
  productSections: [{
    id: String,
    title: String,
    type: { type: String, enum: ['trending', 'popular', 'new-arrivals', 'featured'] },
    limit: { type: Number, default: 8 },
    enabled: { type: Boolean, default: true },
  }],
  middleBanner: BannerSchema,
  bottomBanner: BannerSchema,
  seo: {
    title: String,
    description: String,
    keywords: String,
  },
}, { timestamps: true });

const LandingPage = mongoose.model<ILandingPageDocument>('LandingPageSettings', landingPageSchema);
export default LandingPage;
