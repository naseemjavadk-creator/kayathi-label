import ProductForm from '@/components/admin/ProductForm';

export default function EditProduct({ params }) {
  return <ProductForm productId={params.id} />;
}
