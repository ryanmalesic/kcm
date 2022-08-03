import { Transition, Dialog } from "@headlessui/react";
import { useState, useRef, useCallback, Fragment } from "react";

interface DashboardUploadChartModalProps {
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
}

const DashboardUploadChartModal: React.FC<DashboardUploadChartModalProps> = (
  props
) => {
  const { loading, isOpen, onClose, onSubmit } = props;

  const [file, setFile] = useState<File>();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded shadow">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 "
                >
                  Upload Chart
                </Dialog.Title>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Select a chart to load from
                  </p>
                </div>

                <form
                  className="flex items-center justify-between mt-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!file) {
                      return;
                    }
                    onSubmit(file);
                  }}
                >
                  <input
                    accept="text/csv"
                    className="sr-only"
                    ref={inputRef}
                    type="file"
                    onChange={(event) => {
                      setFile(Array.from(event.target.files ?? [])[0]);
                    }}
                  />
                  <button
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded text-karns-900 bg-karns-100 hover:bg-karns-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-karns focus-visible:ring-offset-2"
                    disabled={loading}
                    type="button"
                    onClick={handleFileInputClick}
                  >
                    Choose File
                  </button>

                  <button
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded text-karns-900 bg-karns-100 disabled:bg-karns-50 disabled:hover:bg-karns-50 hover:bg-karns-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-karns focus-visible:ring-offset-2"
                    disabled={loading || !file}
                    type="submit"
                  >
                    {loading ? "Loading..." : "Upload"}
                  </button>
                </form>
                <span className="block mt-2 text-sm text-karns">
                  {file?.name}
                </span>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DashboardUploadChartModal;
