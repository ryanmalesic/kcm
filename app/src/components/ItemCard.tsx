import React from 'react';

import Item from '../types/item';

interface ItemCardProps {
  isCompact?: boolean;
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = (props: ItemCardProps) => {
  const { isCompact, item } = props;

  if (isCompact) {
    return (
      <div className="item-card flex-shrink-0 border p-2 rounded-md border-gray-200">
        <p className="text-sm text-gray-500">
          SVIC: <span className="text-gray-800">{item.itemCode}</span>
        </p>

        <p className="text-sm text-gray-500">
          UPC: <span className="text-gray-800">{item.upc}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="item-card flex-shrink-0 border p-2 rounded-md border-gray-200">
      <p className="text-sm text-gray-500">
        Brand: <span className="text-gray-800">{item.brand}</span>
      </p>

      <p className="text-sm text-gray-500">
        Item: <span className="text-gray-800">{item.description}</span>
      </p>

      <p className="text-sm text-gray-500">
        SVIC: <span className="text-gray-800">{item.itemCode}</span>
      </p>

      <p className="text-sm text-gray-500">
        UPC: <span className="text-gray-800">{item.upc}</span>
      </p>

      <p className="text-sm text-gray-500">
        Size: <span className="text-gray-800">{item.size}</span>
      </p>

      <p className="text-sm text-gray-500">
        Pack: <span className="text-gray-800">{item.pack}</span>
      </p>

      <p className="text-sm text-gray-500">
        Class Desc: <span className="text-gray-800">{item.classDesc}</span>
      </p>

      <p className="text-sm text-gray-500">
        Sub Class:{' '}
        <span className="text-gray-800">{item.subClassDescription}</span>
      </p>
    </div>
  );
};

export default ItemCard;
