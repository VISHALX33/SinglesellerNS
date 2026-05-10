import React from 'react';
import { Filter, ChevronRight } from 'lucide-react';

const FilterSidebar = ({ categories, subcategories, subSubcategories, activeFilters, onFilterChange }) => {
  return (
    <aside className="filter-sidebar glass">
      <div className="filter-header">
        <Filter size={20} />
        <h3>Filters</h3>
      </div>

      <div className="filter-section">
        <h4>Category</h4>
        <div className="filter-options">
          <button 
            className={`filter-btn ${!activeFilters.category ? 'active' : ''}`}
            onClick={() => onFilterChange('category', '')}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`filter-btn ${activeFilters.category === cat ? 'active' : ''}`}
              onClick={() => onFilterChange('category', cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {activeFilters.category && subcategories.length > 0 && (
        <div className="filter-section">
          <h4>Subcategory</h4>
          <div className="filter-options">
            {subcategories.map(sub => (
              <button 
                key={sub}
                className={`filter-btn ${activeFilters.subcategory === sub ? 'active' : ''}`}
                onClick={() => onFilterChange('subcategory', sub)}
              >
                <ChevronRight size={14} /> {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeFilters.subcategory && subSubcategories.length > 0 && (
        <div className="filter-section">
          <h4>Type</h4>
          <div className="filter-options">
            {subSubcategories.map(subSub => (
              <button 
                key={subSub}
                className={`filter-btn ${activeFilters.subSubcategory === subSub ? 'active' : ''}`}
                onClick={() => onFilterChange('subSubcategory', subSub)}
              >
                <ChevronRight size={14} /> {subSub}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input 
            type="number" placeholder="Min" 
            value={activeFilters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
          />
          <span>-</span>
          <input 
            type="number" placeholder="Max" 
            value={activeFilters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <button className="clear-filters" onClick={() => onFilterChange('clear', '')}>
        Reset All
      </button>
    </aside>
  );
};

export default FilterSidebar;
