import React from 'react';

import { AmplifySignOut } from '@aws-amplify/ui-react';
import clsx from 'clsx';
import { toJpeg } from 'html-to-image';

import ItemCard from '../components/ItemCard';
import useChart from '../hooks/useChart';

function Chart() {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const itemIdInputRef = React.useRef<HTMLInputElement>(null);
  const [itemId, setItemId] = React.useState('');
  const [selectedShelf, setSelectedShelf] = React.useState(0);

  const [chartState, chartActions] = useChart();

  const addShelf = () => {
    chartActions.addShelf(selectedShelf);
    setSelectedShelf((selectedShelf) => selectedShelf + 1);
    itemIdInputRef.current?.focus();
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await chartActions.addItem(itemId, selectedShelf);

    setItemId('');
    itemIdInputRef.current?.focus();
  };

  const downloadChartAsImage = () => {
    if (chartRef.current === null) {
      return;
    }

    console.log(
      document.getElementsByClassName('item-card').item(0)?.clientWidth
    );
    toJpeg(chartRef.current, {
      backgroundColor: 'white',
      width:
        ((document.getElementsByClassName('item-card').item(0)?.clientWidth ??
          0) +
          24) *
        Math.max(...chartState.items.map((shelf) => shelf.length)),
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'set.jpeg';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center h-16 bg-gray-50 p-4 border-b border-gray-200">
        <div>
          <h1 className="text-gray-800 capitalize">Karns Category Manager</h1>
        </div>

        <div>
          <AmplifySignOut />
        </div>
      </header>

      <main className="flex flex-col flex-1 p-4 space-y-2">
        <div className="border border-gray-200 rounded-md p-4 w-full space-y-2 flex items-center justify-between">
          <div>
            <h2 className="text-lg text-gray-800">Add Items</h2>
            <form onSubmit={handleFormSubmit}>
              <input
                disabled={chartState.loading}
                id="itemId"
                name="itemId"
                placeholder="SVIC or UPC"
                ref={itemIdInputRef}
                type="text"
                value={itemId}
                onChange={(event) => setItemId(event.target.value)}
                className="border-b border-gray-200 text-sm ring-0 hover:border-blue-800 focus:border-blue-800 focus:outline-none placeholder-gray-500"
              />
              <button
                disabled={chartState.loading}
                type="submit"
                className="text-sm text-gray-500 hover:text-blue-800 px-2"
              >
                Add Item
              </button>
              <button
                disabled={chartState.loading}
                type="button"
                onClick={addShelf}
                className="text-sm text-gray-500 hover:text-blue-800 px-2"
              >
                Add Shelf
              </button>
              <button
                disabled={chartState.loading}
                type="button"
                onClick={downloadChartAsImage}
                className="text-sm text-gray-500 hover:text-blue-800 px-2"
              >
                Download
              </button>
            </form>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Last item scanned:{' '}
              <span className="text-gray-800">
                {chartState.lastAddedItem?.itemCode}
              </span>
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-md p-4">
          <div ref={chartRef} className="space-y-4 overflow-scroll">
            {chartState.items.map((row, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedShelf(index);
                }}
                className="flex space-x-4"
              >
                <div
                  className={clsx('w-px', {
                    'bg-blue-800': index === selectedShelf,
                    'bg-gray-300': index !== selectedShelf,
                  })}
                />

                <div className="space-x-4 inline-flex">
                  {row.length === 0 && <div className="h-44 p-2" />}
                  {row.map((item, index) => (
                    <ItemCard key={index} isCompact={false} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chart;
