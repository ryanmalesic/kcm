import { Storage } from "@aws-amplify/storage";
import { useCallback, useEffect, useRef, useState } from "react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardActionsMenu from "../components/dashboard/DashboardActionsMenu";
import DashboardAddItemForm from "../components/dashboard/DashboardAddItemForm";
import DashboardShelves from "../components/dashboard/DashboardShelves";
import DashboardUploadMpbModal from "../components/dashboard/DashboardUploadMpbModal";
import { useAppContext } from "../context/AppContext";
import Item from "../types/item";
import ItemsApi, { ItemsCache } from "../api/ItemsApi";
import ShelvesCsvEncoder from "../helpers/ShelvesCsvEncoder";
import CsvDownloader from "../helpers/CsvDownloader";
import ShelvesLocalStorage from "../helpers/ShelvesLocalStorage";
import DashboardUploadChartModal from "../components/dashboard/DashboardUploadChartModal";
import CsvUploader from "../helpers/CsvUploader";

async function uploadPriceBook(file: File) {
  try {
    await Storage.put(file.name.toLowerCase(), file, {
      contentType: file.type,
    });
  } catch (err) {
    console.error(err);
    return;
  }
}

const Dashboard: React.FC = () => {
  const { signOut } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState(0);
  const [shelves, setShelves] = useState<Item[][]>([[]]);
  const [uploadChartOpen, setUploadChartOpen] = useState(false);
  const [uploadMpbOpen, setUploadMpbOpen] = useState(false);

  const cache = useRef<ItemsCache>({});

  const handleAddItemSubmit = useCallback(
    async (itemId: string) => {
      setLoading(true);

      const item = await ItemsApi.getItem(itemId.trim(), cache.current);
      if (!item) {
        setLoading(false);
        // TODO: alert the user that the item doesn't exist in the DB
        return;
      }

      setShelves((shelves) => [
        ...shelves.slice(0, selectedShelf),
        [...shelves[selectedShelf], item],
        ...shelves.slice(selectedShelf + 1),
      ]);
      setLoading(false);
    },
    [selectedShelf]
  );

  const handleAddShelfClick = useCallback(() => {
    setShelves((shelves) => [
      ...shelves.slice(0, selectedShelf + 1),
      [],
      ...shelves.slice(selectedShelf + 1),
    ]);
    setSelectedShelf(selectedShelf + 1);
  }, [selectedShelf]);

  const handleClearClick = useCallback(() => {
    setShelves([[]]);
  }, []);

  const handleDownloadAllClick = useCallback(() => {
    const csv = ShelvesCsvEncoder.encodeDetailed(shelves);
    const name = `chart_${new Date().toISOString()}_detailed.csv`;
    CsvDownloader.download(csv, name);
  }, [shelves]);

  const handleDownloadMissingClick = useCallback(
    (classDesc: string) => () => {
      const itemsInClassDesc = Object.values(cache.current).filter(
        (item) => item.classDesc === classDesc
      );
      const csv = ShelvesCsvEncoder.encodeMissingItems(
        itemsInClassDesc,
        shelves
      );
      const name = `missing_${classDesc.toLowerCase()}_${new Date().toISOString()}.csv`;
      CsvDownloader.download(csv, name);
    },
    [shelves]
  );

  const handleDownloadSvicClick = useCallback(() => {
    const csv = ShelvesCsvEncoder.encode(shelves);
    const name = `chart_${new Date().toISOString()}.csv`;
    CsvDownloader.download(csv, name);
  }, [shelves]);

  const handleRemoveShelfClick = useCallback(() => {
    setShelves((shelves) => [
      ...shelves.slice(0, selectedShelf),
      ...shelves.slice(selectedShelf + 1),
    ]);
    setSelectedShelf(selectedShelf - 1);
  }, [selectedShelf]);

  const handleSignOutClick = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleUploadChartClick = useCallback(() => {
    setUploadChartOpen(true);
  }, []);

  const handleUploadChartSubmit = useCallback(async (file: File) => {
    setLoading(true);
    const shelves = await CsvUploader.uploadChart(file);
    setLoading(false);
    setShelves(shelves);
    setUploadChartOpen(false);
  }, []);

  const handleUploadMpbClick = useCallback(() => {
    setUploadMpbOpen(true);
  }, []);

  const handleUploadMpbSubmit = useCallback(async (file: File) => {
    setLoading(true);
    await uploadPriceBook(file);
    setLoading(false);
    setUploadMpbOpen(false);
  }, []);

  const missingItemsClassDescs = Array.from(
    new Set(shelves.flat(1).map((item) => item.classDesc))
  );

  useEffect(() => {
    async function get() {
      setLoading(true);
      setShelves(await ShelvesLocalStorage.get());
      setLoading(false);
    }
    get();
  }, []);

  useEffect(() => {
    ShelvesLocalStorage.set(shelves);
  }, [shelves]);

  return (
    <>
      <DashboardHeader onSignOutClick={handleSignOutClick} />

      <main className="flex flex-col flex-1 p-8 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-karns-500">Chart</h1>

          <DashboardActionsMenu
            loading={loading}
            missingItemsClassDescs={missingItemsClassDescs}
            selectedShelf={selectedShelf}
            shelves={shelves}
            onAddShelfClick={handleAddShelfClick}
            onClearClick={handleClearClick}
            onDownloadAllClick={handleDownloadAllClick}
            onDownloadMissingClick={handleDownloadMissingClick}
            onDownloadSvicClick={handleDownloadSvicClick}
            onRemoveShelfClick={handleRemoveShelfClick}
            onUploadChartClick={handleUploadChartClick}
            onUploadMpbClick={handleUploadMpbClick}
          />
        </div>

        <DashboardAddItemForm
          disabled={loading || selectedShelf === -1}
          onSubmit={handleAddItemSubmit}
        />

        <DashboardShelves
          selectedShelf={selectedShelf}
          shelves={shelves}
          setSelectedShelf={setSelectedShelf}
        />
      </main>

      <DashboardUploadChartModal
        loading={loading}
        isOpen={uploadChartOpen}
        onClose={() => {
          setUploadChartOpen(false);
        }}
        onSubmit={handleUploadChartSubmit}
      />

      <DashboardUploadMpbModal
        loading={loading}
        isOpen={uploadMpbOpen}
        onClose={() => {
          setUploadMpbOpen(false);
        }}
        onSubmit={handleUploadMpbSubmit}
      />
    </>
  );
};

export default Dashboard;
