interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'type' | 'onChange'> {
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement> | ((checked: boolean) => void);
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  onCheckedChange,
  className = '',
  ...props
}: CheckboxProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    if (typeof onChange === 'function') {
      if (onChange.length === 1) {
        // Call with boolean value for single-parameter handlers
        (onChange as (checked: boolean) => void)(next);
      } else {
        // Call with full event for React.ChangeEventHandler
        (onChange as React.ChangeEventHandler<HTMLInputElement>)(e);
      }
    }
    onCheckedChange?.(next);
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};
