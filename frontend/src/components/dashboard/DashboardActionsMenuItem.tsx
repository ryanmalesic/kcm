import { Menu } from "@headlessui/react";
import { PropsWithChildren } from "react";

interface DashboardActionsMenuItemProps {
  disabled?: boolean;
  onClick: () => void;
}

const DashboardActionsMenuItem: React.FC<
  PropsWithChildren<DashboardActionsMenuItemProps>
> = (props) => {
  const { children, disabled, onClick } = props;

  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={`${
            active && "bg-karns-200 disabled:bg-karns-50"
          } group flex w-full items-center rounded px-2 py-2 text-sm text-left`}
          disabled={disabled}
          type="button"
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
};

export default DashboardActionsMenuItem;
