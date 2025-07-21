import ProductKnowledgeBase from '../ProductKnowledgeBase';
import ThemeToggle from '../components/ThemeToggle';

export default function ProductsPage() {
  return (
    <>
      <div className="flex justify-end mb-2">
        <ThemeToggle />
      </div>
      <ProductKnowledgeBase />
    </>
  );
}