import { useCallback, useEffect, useRef } from "react";

import Item from "../../types/item";

interface DashboardShelvesProps {
  selectedShelf: number;
  shelves: Item[][];
  setSelectedShelf: (shelfIndex: number) => void;
}

const DashboardShelves: React.FC<DashboardShelvesProps> = (props) => {
  const { selectedShelf, shelves, setSelectedShelf } = props;

  const shelfRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleShelfClick = useCallback(
    (shelfIndex: number) => () => {
      setSelectedShelf(shelfIndex);
      shelfRefs.current[shelfIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "end",
      });
    },
    [setSelectedShelf]
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

  useEffect(() => {
    shelfRefs.current[selectedShelf]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "end",
    });
  }, [selectedShelf, shelves]);

  return (
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
                  <span className="block text-sm">
                    {item.upc} {item.restrictPfInd}
                  </span>
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
  );
};

export default DashboardShelves;
