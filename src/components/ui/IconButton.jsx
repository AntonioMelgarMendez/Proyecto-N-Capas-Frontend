
const IconButton = ({
  icon: Icon,
  children,
  onClick,
  variant = 'primary', // 'primary' | 'danger-outline' | 'outline' | 'ghost'
  className = '',
  disabled = false,
  iconSize = 14,
  type = 'button',
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none';

  // Variant styles mapping
  const variants = {
    primary: 'bg-[#091124] text-white hover:bg-[#121f3d] shadow-xs',
    'danger-outline': 'border border-rose-200 text-rose-600 bg-white hover:bg-rose-50',
    outline: 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50',
    ghost: 'text-slate-600 hover:text-[#091124] hover:bg-slate-50',
  };

  const variantStyles = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon size={iconSize} className="shrink-0" />}
      {children && <span>{children}</span>}
    </button>
  );
};

export default IconButton;
