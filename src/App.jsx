/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    item => item.id === product.categoryId,
  ); // find by product.categoryId
  const user = usersFromServer.find(person => person.id === category.ownerId); // find by category.ownerId

  return { ...product, category, user };
});

const SORT_FIELD = {
  id: 'ID',
  product: 'Product',
  category: 'Category',
  user: 'User',
};

function filterPeople(inputProducts, params) {
  const { sortBy, selectedUser, query, sortingOrder, selectedCategory } =
    params;

  let preparedPeople = inputProducts
    .filter(product => {
      if (selectedUser === null) {
        return true;
      }

      return product.user.name === selectedUser;
    })
    .filter(product => {
      return product.name.toLowerCase().includes(query.toLowerCase());
    })
    .toSorted((product1, product2) => {
      if (sortBy === 'id') {
        return product1.id - product2.id;
      }

      if (sortBy === 'product') {
        return product1.name.localeCompare(product2.name);
      }

      if (sortBy === 'category') {
        return product1.category.title.localeCompare(product2.category.title);
      }

      if (sortBy === 'user') {
        return product1.user.name.localeCompare(product2.user.name);
      }

      return 0;
    })
    .filter(product => {
      if (selectedCategory.length === 0) {
        return true;
      }

      return selectedCategory.includes(product.category.id);
    });

  if (sortingOrder === 'desc') {
    preparedPeople = preparedPeople.toReversed();
  }

  return preparedPeople;
}

export const App = () => {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortingOrder, setSortingOrder] = useState('asc');

  const filteredProducts = filterPeople(products, {
    sortBy,
    selectedUser,
    query,
    sortingOrder,
    selectedCategory,
  });

  const onCategoryClick = id => () => {
    if (selectedCategory.includes(id)) {
      setSelectedCategory(selectedCategory.filter(category => category !== id));
    } else {
      setSelectedCategory([...selectedCategory, id]);
    }
  };

  const onSortFieldClick = key => {
    setSortBy(key);
    if (key !== sortBy) {
      setSortingOrder('asc');
    } else {
      setSortingOrder(sortingOrder === 'asc' ? 'desc' : 'asc');
    }

    if (key === sortBy && sortingOrder === 'desc') {
      setSortBy(null);
    }
  };

  const onReset = () => {
    setSelectedUser(null);
    setQuery('');
    setSelectedCategory([]);
    // setSortBy(null);
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': selectedUser === null })}
                onClick={() => setSelectedUser(null)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({ 'is-active': selectedUser === user.name })}
                  onClick={() => setSelectedUser(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query !== '' && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategory.length !== 0,
                })}
                onClick={() => setSelectedCategory([])}
              >
                All
              </a>
              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategory.includes(category.id),
                  })}
                  href="#/"
                  onClick={onCategoryClick(category.id)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={onReset}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {filteredProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {Object.keys(SORT_FIELD).map(key => (
                    <th key={key}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {SORT_FIELD[key]}
                        <a href="#/" onClick={() => onSortFieldClick(key)}>
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn({
                                'fas fa-sort': sortBy !== key,
                                'fas fa-sort-up':
                                  sortBy === key && sortingOrder === 'asc',
                                'fas fa-sort-down':
                                  sortBy === key && sortingOrder === 'desc',
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={
                        product.user.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
