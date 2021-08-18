import { API } from 'aws-amplify';
import React from 'react';
import consts from '../consts';
import { transformUpc } from '../helpers/item';
import Item from '../types/item';

type State = {
  error: string | null;
  loading: boolean;
  items: Item[][];
  lastAddedItem: Item | null;
};

type Action =
  | { type: 'ADD_ITEM_LOADING' }
  | { type: 'ADD_ITEM_SUCCESS'; payload: { item: Item; shelf: number } }
  | { type: 'ADD_ITEM_FAILURE'; payload: string }
  | { type: 'ADD_SHELF'; payload: number };

const makeAddItemLoading = (): Action => {
  return { type: 'ADD_ITEM_LOADING' };
};

const makeAddItemSuccess = (payload: { item: Item; shelf: number }): Action => {
  return { type: 'ADD_ITEM_SUCCESS', payload };
};

const makeAddItemFailure = (payload: string): Action => {
  return { type: 'ADD_ITEM_FAILURE', payload };
};

const makeAddShelfAction = (payload: number): Action => {
  return { type: 'ADD_SHELF', payload };
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM_LOADING':
      return { ...state, error: null, loading: true };
    case 'ADD_ITEM_SUCCESS':
      return {
        ...state,
        loading: false,
        items: [
          ...state.items.slice(0, action.payload.shelf),
          [...state.items[action.payload.shelf], action.payload.item],
          ...state.items.slice(action.payload.shelf + 1),
        ],
        lastAddedItem: action.payload.item,
      };
    case 'ADD_ITEM_FAILURE':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_SHELF':
      return {
        ...state,
        items: [
          ...state.items.slice(0, action.payload + 1),
          [],
          ...state.items.slice(action.payload + 1),
        ],
      };
    default:
      return { ...state };
  }
}

const initialState: State = {
  error: null,
  loading: false,
  items: [[]],
  lastAddedItem: null,
};

type ExportedActions = {
  addItem: (itemId: string, shelf: number) => Promise<void>;
  addShelf: (after: number) => void;
};

const useChart = (): [State, ExportedActions] => {
  const itemsCache = React.useRef<{ [key: string]: Item }>({});
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const addItem = React.useCallback(async (itemId: string, shelf: number) => {
    dispatch(makeAddItemLoading());

    let item: Item;

    // Item Code Cache
    if (itemsCache.current[itemId.substring(0, 7)]) {
      item = itemsCache.current[itemId.substring(0, 7)];
      dispatch(makeAddItemSuccess({ item, shelf }));
      return;
    }

    // UPC Cache
    if (itemsCache.current[transformUpc(itemId)]) {
      item = itemsCache.current[transformUpc(itemId)];
      dispatch(makeAddItemSuccess({ item, shelf }));
      return;
    }

    try {
      item = await API.get(consts.apiName, `/items/${itemId}`, {});
      dispatch(makeAddItemSuccess({ item, shelf }));
    } catch {
      dispatch(makeAddItemFailure('Error'));
      return;
    }

    try {
      const otherItems: Item[] = await API.get(consts.apiName, '/items', {
        queryStringParameters: { classDesc: item.classDesc },
      });

      otherItems.forEach((item) => {
        itemsCache.current[item.itemCode] = item;
        itemsCache.current[item.upc] = item;
      });
    } catch (err) {
      console.error('Caching failed: ' + err);
    }
  }, []);

  const addShelf = (after: number) => {
    dispatch(makeAddShelfAction(after));
  };

  return [state, { addItem, addShelf }];
};

export default useChart;
