const remToPx = (sizeInRem) => {
  if(typeof window === "undefined") 
    return sizeInRem;
  return  sizeInRem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export default remToPx;