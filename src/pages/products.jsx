import ProductKnowledgeBase from '../ProductKnowledgeBase';
import ThemeToggle from '../components/ThemeToggle.jsx';

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