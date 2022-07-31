interface DashboardHeaderProps {
  onSignOutClick: () => Promise<void>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = (props) => {
  const { onSignOutClick } = props;

  return (
    <header className="flex items-center justify-between w-full px-8 py-3 border shadow">
      <img className="w-10 h-10" alt="Karns logo" src="/logo.png" />
      <div>
        <button
          className="text-sm font-medium text-gray-500 hover:text-karns-500"
          onClick={onSignOutClick}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
