export const isDarkBackground = (color) => {
    const rgb = parseInt(color.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance < 128; // Dark if luminance is less than 128
  };
  
  export const getTextColor = (backgroundColor) => {
    return isDarkBackground(backgroundColor) ? '#fff' : '#000';
  };
  
  export const getInputBackgroundColor = (backgroundColor) => {
    return isDarkBackground(backgroundColor) ? '#333' : '#fff';
  };


  export const getLighterColor = (color) => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + 20);
    const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + 20);
    const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + 20);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };