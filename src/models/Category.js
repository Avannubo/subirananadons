import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Generate slug before saving
categorySchema.pre('save', function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
    next();
});

// Virtual for getting child categories
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Method to get all subcategories
categorySchema.methods.getAllSubcategories = async function () {
    const Category = mongoose.model('Category');

    const findChildren = async (categoryId, allCategories = []) => {
        const children = await Category.find({ parent: categoryId });

        if (children.length === 0) {
            return allCategories;
        }

        allCategories.push(...children);

        for (const child of children) {
            await findChildren(child._id, allCategories);
        }

        return allCategories;
    };

    return findChildren(this._id);
};

export default mongoose.models.Category || mongoose.model('Category', categorySchema); 