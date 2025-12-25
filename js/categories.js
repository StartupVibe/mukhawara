import { categoryService } from './api/categories/categoryService.js';

class CategoryManager {
    constructor() {
        this.categoriesContainer = document.querySelector('.categories .row');
        console.log('CategoryManager initialized, container:', this.categoriesContainer);
        this.init();
    }

    async init() {
        try {
            await this.loadCategories();
        } catch (error) {
            console.error('Failed to initialize category manager:', error);
        }
    }

    async loadCategories() {
        try {
            const response = await categoryService.getCategories({
                per_page: 20
            });
            
            if (response.data && response.data.length > 0) {
                this.renderCategories(response.data);
            } else {
                this.showNoCategoriesMessage();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            throw error;
        }
    }

    renderCategories(categories) {
        if (!this.categoriesContainer) {
            console.error('Categories container not found');
            return;
        }
        
        console.log('Rendering categories:', categories);
        this.categoriesContainer.innerHTML = categories.map(category => `
            <div class="col-6 col-md-4 col-lg-2">
                <div class="category" style="cursor: pointer; padding: 15px; text-align: center; border: 1px solid #ddd; border-radius: 8px; transition: all 0.3s ease;" data-category-id="${category.id}">
                    <div class="text">
                        <h4 style="margin: 0; font-size: 14px; font-weight: 600;">${category.name}</h4>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const categoryElement = e.target.closest('.category');
            if (categoryElement) {
                const categoryId = categoryElement.dataset.categoryId;
                this.navigateToCategory(categoryId);
            }
        });
    }

    navigateToCategory(categoryId) {
        window.location.href = `products.php?category=${categoryId}`;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    }

    showNoCategoriesMessage() {
        if (this.categoriesContainer) {
            this.categoriesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h4>No categories found</h4>
                    <p>There are no categories available at the moment.</p>
                </div>
            `;
        }
    }
}

// Export the CategoryManager class
export { CategoryManager };

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.categories')) {
        new CategoryManager();
    }
});
