/**
 * Curated icon registry for Font Awesome icons
 * This registry contains commonly used icons to avoid importing ALL icons
 * which dramatically slows down the build process.
 * 
 * Add icons here as they are needed in the application.
 */

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  // Common UI icons
  faCheck,
  faX,
  faPlus,
  faTrash,
  faPencil,
  faGear,
  faSearch,
  faBars,
  faEllipsisVertical,
  faSpinner,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faArrowDown,
  faExternalLinkAlt,
  faEye,
  faDownload,
  faUpload,
  faFile,
  faFileAlt,
  faImage,
  faVideo,
  faLink,
  faGripVertical,
  faMousePointer,
  faPlay,
  faHeading,
  faCode,
  
  // Content icons
  faBook,
  faLock,
  faGlobe,
  faUser,
  faBuilding,
  faQuoteLeft,
  faStar,
  faStarHalfStroke,
  faCircleQuestion,
  faQuestionCircle,
  faListOl,
  faBullseye,
  faComments,
  faHandshake,
  faGaugeHigh,
  faSliders,
  faWandMagicSparkles,
  faCheckCircle,
  faShieldAlt,
  faCloudUploadAlt,
  
  // Add more icons as needed
} from "@fortawesome/free-solid-svg-icons";

/**
 * Icon registry mapping icon class names to IconDefinitions
 * This is a curated list - add icons here as they are used in the app
 */
const iconRegistry: Record<string, IconDefinition> = {
  // Common UI
  'check': faCheck,
  'fa-check': faCheck,
  'x': faX,
  'fa-x': faX,
  'plus': faPlus,
  'fa-plus': faPlus,
  'trash': faTrash,
  'fa-trash': faTrash,
  'pencil': faPencil,
  'fa-pencil': faPencil,
  'gear': faGear,
  'fa-gear': faGear,
  'search': faSearch,
  'fa-search': faSearch,
  'bars': faBars,
  'fa-bars': faBars,
  'ellipsis-vertical': faEllipsisVertical,
  'fa-ellipsis-vertical': faEllipsisVertical,
  'spinner': faSpinner,
  'fa-spinner': faSpinner,
  'arrow-left': faArrowLeft,
  'fa-arrow-left': faArrowLeft,
  'arrow-right': faArrowRight,
  'fa-arrow-right': faArrowRight,
  'arrow-up': faArrowUp,
  'fa-arrow-up': faArrowUp,
  'arrow-down': faArrowDown,
  'fa-arrow-down': faArrowDown,
  'external-link-alt': faExternalLinkAlt,
  'fa-external-link-alt': faExternalLinkAlt,
  'eye': faEye,
  'fa-eye': faEye,
  'download': faDownload,
  'fa-download': faDownload,
  'upload': faUpload,
  'fa-upload': faUpload,
  'file': faFile,
  'fa-file': faFile,
  'file-alt': faFileAlt,
  'fa-file-alt': faFileAlt,
  'image': faImage,
  'fa-image': faImage,
  'video': faVideo,
  'fa-video': faVideo,
  'link': faLink,
  'fa-link': faLink,
  'grip-vertical': faGripVertical,
  'fa-grip-vertical': faGripVertical,
  'mouse-pointer': faMousePointer,
  'fa-mouse-pointer': faMousePointer,
  'play': faPlay,
  'fa-play': faPlay,
  'heading': faHeading,
  'fa-heading': faHeading,
  'code': faCode,
  'fa-code': faCode,
  
  // Content
  'book': faBook,
  'fa-book': faBook,
  'lock': faLock,
  'fa-lock': faLock,
  'globe': faGlobe,
  'fa-globe': faGlobe,
  'user': faUser,
  'fa-user': faUser,
  'building': faBuilding,
  'fa-building': faBuilding,
  'quote-left': faQuoteLeft,
  'fa-quote-left': faQuoteLeft,
  'star': faStar,
  'fa-star': faStar,
  'star-half-stroke': faStarHalfStroke,
  'fa-star-half-stroke': faStarHalfStroke,
  'circle-question': faCircleQuestion,
  'fa-circle-question': faCircleQuestion,
  'question-circle': faQuestionCircle,
  'fa-question-circle': faQuestionCircle,
  'list-ol': faListOl,
  'fa-list-ol': faListOl,
  'bullseye': faBullseye,
  'fa-bullseye': faBullseye,
  'comments': faComments,
  'fa-comments': faComments,
  'handshake': faHandshake,
  'fa-handshake': faHandshake,
  'gauge-high': faGaugeHigh,
  'gauge': faGaugeHigh,
  'fa-gauge-high': faGaugeHigh,
  'fa-gauge': faGaugeHigh,
  'sliders': faSliders,
  'fa-sliders': faSliders,
  'wand-magic-sparkles': faWandMagicSparkles,
  'wand-magic': faWandMagicSparkles,
  'wand': faWandMagicSparkles,
  'magic': faWandMagicSparkles,
  'fa-wand-magic-sparkles': faWandMagicSparkles,
  'fa-wand-magic': faWandMagicSparkles,
  'fa-wand': faWandMagicSparkles,
  'fa-magic': faWandMagicSparkles,
  'check-circle': faCheckCircle,
  'fa-check-circle': faCheckCircle,
  'badge-check': faCheckCircle,
  'badge': faCheckCircle,
  'fa-badge-check': faCheckCircle,
  'fa-badge': faCheckCircle,
  'shield-alt': faShieldAlt,
  'shield-check': faShieldAlt,
  'fa-shield-alt': faShieldAlt,
  'fa-shield-check': faShieldAlt,
  'cloud-upload-alt': faCloudUploadAlt,
  'fa-cloud-upload-alt': faCloudUploadAlt,
};

/**
 * Resolves an icon class name to an IconDefinition from the curated registry
 * Returns null if the icon is not found in the registry
 */
export function resolveIconFromRegistry(
  iconClass: string | null | undefined
): IconDefinition | null {
  if (!iconClass) {
    return null;
  }

  // Normalize the icon class name
  let iconName = iconClass.trim().toLowerCase();
  
  // Check registry first
  if (iconRegistry[iconName]) {
    return iconRegistry[iconName];
  }
  
  // Remove "fa-" prefix if present
  if (iconName.startsWith("fa-")) {
    iconName = iconName.substring(3);
    if (iconRegistry[iconName]) {
      return iconRegistry[iconName];
    }
  }
  
  // Remove leading "fa" if present (e.g., "fapen" -> "pen")
  if (iconName.startsWith("fa") && iconName.length > 2) {
    iconName = iconName.substring(2);
    if (iconRegistry[iconName]) {
      return iconRegistry[iconName];
    }
  }

  return null;
}

/**
 * Dynamically loads all Font Awesome icons (for IconPickerModal)
 * This is only called when the icon picker modal is opened
 * This prevents importing thousands of icons during build time
 */
export async function loadAllIcons(): Promise<Record<string, IconDefinition>> {
  // Dynamic import - only loads when this function is called
  // This dramatically improves build performance
  const IconsModule = await import("@fortawesome/free-solid-svg-icons");
  
  // The module exports all icons as named exports, we need to convert to a record
  const iconsRecord: Record<string, IconDefinition> = {};
  
  // Iterate through all exports and add icon definitions
  for (const [key, value] of Object.entries(IconsModule)) {
    // Check if it's an IconDefinition (has icon property)
    if (
      value &&
      typeof value === 'object' &&
      'icon' in value &&
      key.startsWith('fa')
    ) {
      iconsRecord[key] = value as IconDefinition;
    }
  }
  
  return iconsRecord;
}

