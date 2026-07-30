function Loader({ size = "md", ariaLabel = "Loading..." }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-[3px]",
    lg: "w-10 h-10 border-4",
  };

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`
        ${sizes[size]}
        inline-block
        animate-spin
        rounded-full
        border-gray-300
        border-t-yellow-500
        border-solid
      `}
    />
  );
}

export default Loader;