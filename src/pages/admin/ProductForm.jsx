import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/solid";
import { listProducts, createProduct, updateProduct, deleteProduct } from "../../api/products";

const EMPTY_PRODUCT = {
  company: "Switch Commerce",
  title: "",
  description: "",
  problem: "",
  villain: "",
  plan: "",
  cta: "",
  success: "",
  failure: "",
  transformation: "",
  useCases: "",
  keywords: "",
  type: "Service",
  problemTags: "",
  outcomeTags: "",
  buyerTags: "",
  industryTags: "",
  _synonymsTitle: "",
  _synonymsDescription: "",
  _synonymsKeywords: "",
};

const COMPANIES = ["Switch Commerce", "Clear Choice"];
const TYPES = ["ATM", "Hardware", "Kiosk", "Platform", "Service", "Software"];

function Field({ label, name, value, onChange, rows, placeholder, hint }) {
  const Input = rows ? "textarea" : "input";
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-300 mb-1">{label}</div>
      <Input
        type={rows ? undefined : "text"}
        rows={rows}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#0951fa] focus:outline-none focus:ring-1 focus:ring-[#0951fa] transition-colors"
      />
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-300 mb-1">{label}</div>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#0951fa] focus:outline-none focus:ring-1 focus:ring-[#0951fa] transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    listProducts()
      .then((list) => {
        if (cancelled) return;
        const found = list.find((p) => p.id === id);
        if (!found) setError("Product not found");
        else setProduct(found);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id, isNew]);

  const handleChange = (e) => {
    setProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) await createProduct(product);
      else await updateProduct(product);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || "Save failed");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await deleteProduct(product.id);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || "Delete failed");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-3xl mx-auto text-center py-16 text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/admin/products" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeftIcon className="h-4 w-4" /> Back to products
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0951fa] to-[#0a7cff] bg-clip-text text-transparent">
            {isNew ? "New Product" : "Edit Product"}
          </h1>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" /> Delete
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-700/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-gray-800/40 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Company" name="company" value={product.company} onChange={handleChange} options={COMPANIES} />
              <SelectField label="Type" name="type" value={product.type} onChange={handleChange} options={TYPES} />
            </div>
            <Field label="Title" name="title" value={product.title} onChange={handleChange} placeholder="Product name" />
            <Field label="Description" name="description" value={product.description} onChange={handleChange} rows={3} placeholder="Short marketing description" />
          </section>

          <section className="bg-gray-800/40 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Story</h2>
            <Field label="Problem" name="problem" value={product.problem} onChange={handleChange} rows={2} hint="Customer pain point" />
            <Field label="Villain" name="villain" value={product.villain} onChange={handleChange} rows={2} hint="Root cause / obstacle" />
            <Field label="Plan" name="plan" value={product.plan} onChange={handleChange} rows={3} hint="The solution you offer" />
            <Field label="Call to Action" name="cta" value={product.cta} onChange={handleChange} rows={2} />
            <Field label="Success" name="success" value={product.success} onChange={handleChange} rows={2} />
            <Field label="Failure avoided" name="failure" value={product.failure} onChange={handleChange} rows={2} />
            <Field label="Transformation" name="transformation" value={product.transformation} onChange={handleChange} rows={2} />
            <Field label="Use Cases" name="useCases" value={product.useCases} onChange={handleChange} rows={2} />
          </section>

          <section className="bg-gray-800/40 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Tags & keywords</h2>
            <Field label="Keywords" name="keywords" value={product.keywords} onChange={handleChange} placeholder="#Tag1 #Tag2 #Tag3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Problem tags" name="problemTags" value={product.problemTags} onChange={handleChange} placeholder="#tag1 #tag2" />
              <Field label="Outcome tags" name="outcomeTags" value={product.outcomeTags} onChange={handleChange} placeholder="#tag1 #tag2" />
              <Field label="Buyer tags" name="buyerTags" value={product.buyerTags} onChange={handleChange} placeholder="#ISO #merchant" />
              <Field label="Industry tags" name="industryTags" value={product.industryTags} onChange={handleChange} placeholder="#retail" />
            </div>
          </section>

          <section className="bg-gray-800/40 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">Search synonyms <span className="text-xs font-normal text-gray-500">(optional)</span></h2>
            <Field label="Title synonyms" name="_synonymsTitle" value={product._synonymsTitle} onChange={handleChange} hint="Comma-separated alternative titles" />
            <Field label="Description synonyms" name="_synonymsDescription" value={product._synonymsDescription} onChange={handleChange} hint="Comma-separated related terms" />
            <Field label="Keyword synonyms" name="_synonymsKeywords" value={product._synonymsKeywords} onChange={handleChange} hint="Comma-separated alternate keywords" />
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/admin/products" className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !product.title}
              className="px-6 py-2.5 bg-[#0951fa] hover:bg-[#0951fa]/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
