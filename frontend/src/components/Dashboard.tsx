import { Dialog, Menu, Transition } from "@headlessui/react";
import { API } from "@aws-amplify/api";
import { Storage } from "@aws-amplify/storage";
import {
  FormEventHandler,
  Fragment,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAppContext } from "../context/AppContext";
import Item from "../types/item";

async function getItem(
  id: string,
  cache: { [key: string]: Item } = {}
): Promise<Item | undefined> {
  if (
    cache[id.substring(0, 7)] ||
    cache[`000-${id.substring(1, 6)}-${id.substring(6, 11)}`]
  ) {
    return (
      cache[id.substring(0, 7)] ??
      cache[`000-${id.substring(1, 6)}-${id.substring(6, 11)}`]
    );
  }

  try {
    const item = await API.get("items", `/items/${id}`, {});
    return item;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

async function getItemsByClassDesc(classDesc: string): Promise<Item[]> {
  try {
    const items = API.get("items", `/items?classDesc=${classDesc}`, {});
    return items;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function uploadPriceBook(file: File) {
  try {
    await Storage.put(file.name.toLowerCase(), file, {
      contentType: file.type,
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

const Dashboard: React.FC = () => {
  const { signOut } = useAppContext();

  const [itemId, setItemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState(0);
  const [shelves, setShelves] = useState<Item[][]>([[]]);
  const [uploadOpen, setUploadOpen] = useState(false);

  const cache = useRef<{ [key: string]: Item }>({});
  const idRef = useRef<HTMLInputElement | null>(null);
  const shelfRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSignOutClick = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleAddShelfClick = useCallback(() => {
    setShelves((shelves) => [
      ...shelves.slice(0, selectedShelf + 1),
      [],
      ...shelves.slice(selectedShelf + 1),
    ]);
    setSelectedShelf(selectedShelf + 1);
  }, [selectedShelf]);

  const handleRemoveShelfClick = useCallback(() => {
    setShelves((shelves) => [
      ...shelves.slice(0, selectedShelf),
      ...shelves.slice(selectedShelf + 1),
    ]);
    setSelectedShelf(selectedShelf - 1);
  }, [selectedShelf]);

  const handleShelfClick = useCallback(
    (shelf: number) => () => {
      setSelectedShelf(shelf);
      shelfRefs.current[shelf]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "end",
      });
    },
    []
  );

  const handleDownloadSvicClick = useCallback(() => {
    const uri = shelves.reduce(
      (prev, curr, index) =>
        prev +
        `${index !== 0 ? "\n" : ""}${curr.reduce(
          (prev, curr, index) =>
            prev + `${index !== 0 ? "," : ""}${curr.itemCode}`,
          ""
        )}`,
      "data:text/csv;charset=utf-8,"
    );

    const encodedUri = encodeURI(uri);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chart_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  }, [shelves]);

  const handleDownloadAllClick = useCallback(() => {
    const uri = shelves.reduce((prev, curr, index) => {
      const temp: { [key: string]: string[] } = {};
      curr.forEach((item) => {
        temp["brandDescription"] = [
          ...(temp["brandDescription"] ?? []),
          `${item.brand} ${item.description}`,
        ];
        temp["packSize"] = [
          ...(temp["packSize"] ?? []),
          `${item.pack} ${item.size}`,
        ];
        temp["upc"] = [...(temp["upc"] ?? []), item.upc];
        temp["itemCode"] = [...(temp["itemCode"] ?? []), item.itemCode];
      });

      return (
        prev +
        `${index !== 0 ? "\n\n" : ""}${temp["brandDescription"].join(
          ","
        )}\n${temp["packSize"].join(",")}\n${temp["upc"].join(",")}\n${temp[
          "itemCode"
        ].join(",")}`
      );
    }, "data:text/csv;charset=utf-8,");

    const encodedUri = encodeURI(uri);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chart_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  }, [shelves]);

  const handleDownloadMissingClick = useCallback(
    (classDesc: string) => () => {
      const uri =
        "data:text/csv;charset=utf-8," +
        Object.values(cache.current)
          .filter(
            (item, index, arr) =>
              item.classDesc === classDesc &&
              index === arr.findIndex((i) => i.itemCode === item.itemCode) &&
              !shelves
                .flat(1)
                .map((item) => item.itemCode)
                .includes(item.itemCode)
          )
          .map(
            (item) =>
              `${item.itemCode},${item.upc},${item.brand},${item.description},${item.pack},${item.size},${item.classDesc},${item.subClassDescription},${item.restrictPfInd}`
          )
          .join("\n");

      const encodedUri = encodeURI(uri);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `missing_${classDesc.toLowerCase()}_${new Date().toISOString()}.csv`
      );
      document.body.appendChild(link);
      link.click();
    },
    [shelves]
  );

  const handleUploadClick = useCallback(() => {
    setUploadOpen(true);
  }, []);

  const handleClearClick = useCallback(() => {
    setShelves([[]]);
  }, []);

  const handleSubmit = useCallback<FormEventHandler>(
    async (event) => {
      event.preventDefault();

      if (loading || selectedShelf === -1) {
        return;
      }

      setLoading(true);

      const item = await getItem(itemId.trim(), cache.current);

      setItemId("");

      if (!item) {
        setLoading(false);
        return;
      }

      setShelves((shelves) => [
        ...shelves.slice(0, selectedShelf),
        [...shelves[selectedShelf], item],
        ...shelves.slice(selectedShelf + 1),
      ]);
      shelfRefs.current[selectedShelf]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "end",
      });

      idRef.current?.focus();

      if (!cache.current[item.itemCode]) {
        const items = await getItemsByClassDesc(item.classDesc);
        items.forEach((item) => {
          cache.current[item.itemCode] = item;
          cache.current[item.upc] = item;
        });
      }

      setLoading(false);
    },
    [itemId, loading, selectedShelf]
  );

  useEffect(() => {
    shelfRefs.current[selectedShelf]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "end",
    });
  }, [selectedShelf]);

  useEffect(() => {
    shelfRefs.current = shelfRefs.current.slice(0, shelves.length);
  }, [shelves]);

  const missingItemsClassDescs = Array.from(
    new Set(shelves.flat(1).map((item) => item.classDesc))
  );

  return (
    <>
      <header className="flex items-center justify-between w-full px-8 py-3 border shadow">
        <img className="w-10 h-10" alt="Karns logo" src="/logo.png" />
        <div>
          <button
            className="text-sm font-medium text-gray-500 hover:text-karns-500"
            onClick={handleSignOutClick}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex flex-col flex-1 p-8 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-karns-500">Chart</h1>

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
                  <MenuItem disabled={loading} onClick={handleAddShelfClick}>
                    Add Shelf
                  </MenuItem>
                  <MenuItem
                    disabled={loading || selectedShelf === -1}
                    onClick={handleRemoveShelfClick}
                  >
                    Remove Shelf
                  </MenuItem>
                </div>

                <div className="px-1 py-1">
                  <MenuItem
                    disabled={loading || shelves.flat(1).length === 0}
                    onClick={handleDownloadSvicClick}
                  >
                    Download Chart (SVIC)
                  </MenuItem>
                  <MenuItem
                    disabled={loading || shelves.flat(1).length === 0}
                    onClick={handleDownloadAllClick}
                  >
                    Download Chart (All)
                  </MenuItem>
                </div>

                <div className="px-1 py-1">
                  {missingItemsClassDescs.map((classDesc) => (
                    <MenuItem
                      disabled={loading || shelves.flat(1).length === 0}
                      key={classDesc}
                      onClick={handleDownloadMissingClick(classDesc)}
                    >
                      Download Missing{" "}
                      {classDesc
                        .toLowerCase()
                        .split(" ")
                        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                        .join(" ")}
                    </MenuItem>
                  ))}
                </div>

                <div className="px-1 py-1">
                  <MenuItem disabled={loading} onClick={handleUploadClick}>
                    Upload Price Book
                  </MenuItem>
                </div>

                <div className="px-1 py-1">
                  <MenuItem disabled={loading} onClick={handleClearClick}>
                    Clear
                  </MenuItem>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        <form className="space-x-4" onSubmit={handleSubmit}>
          <input
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-karns-500 disabled:focus:ring-0"
            disabled={loading || selectedShelf === -1}
            id="id"
            name="id"
            placeholder="SVIC or UPC"
            ref={idRef}
            required
            type="text"
            value={itemId}
            onChange={(event) => setItemId(event.target.value)}
          />

          <button
            className="inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded bg-karns-100 hover:bg-karns-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-karns focus-visible:ring-offset-2"
            disabled={loading || selectedShelf === -1}
            type="submit"
          >
            Add Item
          </button>
        </form>

        <div className="overflow-y-scroll border rounded snap-y snap-mandatory bg-gray-50">
          {shelves.map((shelf, shelfIndex) => (
            <div
              className={
                shelfIndex === selectedShelf
                  ? "bg-gray-200 snap-start"
                  : "snap-start"
              }
              key={shelfIndex}
              role="button"
              onClick={handleShelfClick(shelfIndex)}
            >
              <div className="p-4">
                <div className="flex items-center gap-4 overflow-x-scroll no-scrollbar snap-mandatory snap-x">
                  {shelf.map((item, itemIndex) => (
                    <div
                      className="flex-shrink-0 p-4 bg-white border rounded shadow w-72 snap-start"
                      key={itemIndex}
                    >
                      <span className="block text-sm">
                        {item.brand} {item.description}
                      </span>
                      <span className="block text-sm">
                        {item.pack} {item.size}
                      </span>
                      <span className="block text-sm">{item.upc}</span>
                      <span className="block text-sm font-semibold text-karns">
                        {item.itemCode}
                      </span>
                    </div>
                  ))}
                  {shelf.length === 0 && (
                    <div className="flex-shrink-0 w-72 h-[112px] border border-dashed rounded border-karns snap-start" />
                  )}
                  <div
                    className={`flex-shrink-0 w-72 h-[112px] border border-dashed rounded snap-start ${
                      shelf.length !== 0 && shelfIndex === selectedShelf
                        ? "border-karns"
                        : "border-transparent"
                    }`}
                    ref={(el) => (shelfRefs.current[shelfIndex] = el)}
                  />
                </div>
              </div>
              <hr />
            </div>
          ))}
        </div>
      </main>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
        }}
      />
    </>
  );
};

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = (props) => {
  const { isOpen, onClose } = props;

  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleSubmit = useCallback<FormEventHandler>(
    async (event) => {
      event.preventDefault();

      if (!file) {
        return;
      }

      setLoading(true);
      await uploadPriceBook(file);
      setLoading(false);
      onClose();
    },
    [file, onClose]
  );

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
                  Upload Price Book
                </Dialog.Title>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Select a price book to upload items from
                  </p>
                </div>

                <form
                  className="flex items-center justify-between mt-4"
                  onSubmit={handleSubmit}
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

interface MenuItemProps {
  disabled?: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<PropsWithChildren<MenuItemProps>> = (props) => {
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

export default Dashboard;
