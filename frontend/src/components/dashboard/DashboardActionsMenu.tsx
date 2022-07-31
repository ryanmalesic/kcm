import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

import DashboardActionsMenuItem from "./DashboardActionsMenuItem";
import Item from "../../types/item";

interface DashboardActionsMenuProps {
  loading: boolean;
  missingItemsClassDescs: string[];
  selectedShelf: number;
  shelves: Item[][];
  onAddShelfClick: () => void;
  onClearClick: () => void;
  onDownloadAllClick: () => void;
  onDownloadMissingClick: (classDesc: string) => () => void;
  onDownloadSvicClick: () => void;
  onRemoveShelfClick: () => void;
  onUploadMpbClick: () => void;
}

const DashboardActionsMenu: React.FC<DashboardActionsMenuProps> = (props) => {
  const {
    loading,
    missingItemsClassDescs,
    selectedShelf,
    shelves,
    onAddShelfClick,
    onClearClick,
    onDownloadAllClick,
    onDownloadMissingClick,
    onDownloadSvicClick,
    onRemoveShelfClick,
    onUploadMpbClick,
  } = props;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium border border-transparent rounded text-karns-900 bg-karns-100 hover:bg-karns-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-karns focus-visible:ring-offset-2">
        Actions
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white border divide-y divide-gray-200 rounded shadow focus:outline-none">
          <div className="px-1 py-1 ">
            <DashboardActionsMenuItem
              disabled={loading}
              onClick={onAddShelfClick}
            >
              Add Shelf
            </DashboardActionsMenuItem>
            <DashboardActionsMenuItem
              disabled={loading || selectedShelf === -1}
              onClick={onRemoveShelfClick}
            >
              Remove Shelf
            </DashboardActionsMenuItem>
          </div>

          <div className="px-1 py-1">
            <DashboardActionsMenuItem
              disabled={loading || shelves.flat(1).length === 0}
              onClick={onDownloadSvicClick}
            >
              Download Chart (SVIC)
            </DashboardActionsMenuItem>
            <DashboardActionsMenuItem
              disabled={loading || shelves.flat(1).length === 0}
              onClick={onDownloadAllClick}
            >
              Download Chart (All)
            </DashboardActionsMenuItem>
          </div>

          <div className="px-1 py-1">
            {missingItemsClassDescs.map((classDesc) => (
              <DashboardActionsMenuItem
                disabled={loading || shelves.flat(1).length === 0}
                key={classDesc}
                onClick={onDownloadMissingClick(classDesc)}
              >
                Download Missing{" "}
                {classDesc
                  .toLowerCase()
                  .split(" ")
                  .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                  .join(" ")}
              </DashboardActionsMenuItem>
            ))}
          </div>

          <div className="px-1 py-1">
            <DashboardActionsMenuItem
              disabled={loading}
              onClick={onUploadMpbClick}
            >
              Upload Price Book
            </DashboardActionsMenuItem>
          </div>

          <div className="px-1 py-1">
            <DashboardActionsMenuItem disabled={loading} onClick={onClearClick}>
              Clear
            </DashboardActionsMenuItem>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DashboardActionsMenu;
