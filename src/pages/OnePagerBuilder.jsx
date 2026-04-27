import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProducts } from '../api/products';

const BRAND_THEMES = {
  'Switch Commerce': {
    badge: 'Switch Commerce',
    accent: '#0951fa',
    accentSoft: 'rgba(9, 81, 250, 0.14)',
    accentStrong: 'rgba(9, 81, 250, 0.24)',
    heading: 'from-[#0951fa] to-cyan-300',
    button: 'bg-[#0951fa] hover:bg-[#0745d3]',
  },
  'Clear Choice': {
    badge: 'Clear Choice',
    accent: '#ff4f00',
    accentSoft: 'rgba(255, 79, 0, 0.14)',
    accentStrong: 'rgba(255, 79, 0, 0.22)',
    heading: 'from-[#ff4f00] to-amber-300',
    button: 'bg-[#ff4f00] hover:bg-[#d94300]',
  },
};

const EMPTY_FORM = {
  productId: '',
  prospectName: '',
  prospectCompany: '',
  painPoint: '',
  repName: '',
  repTitle: '',
  repEmail: '',
  repPhone: '',
  callToAction: '',
};

function formatKeywords(value) {
  if (!value) return [];
  return value
    .split(/[#\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function splitUseCases(value) {
  if (!value) return [];
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function buildHeadline(product, prospectName) {
  if (!product) return 'Create a tailored sales one-pager in minutes';
  if (prospectName) return `${product.title} for ${prospectName}`;
  return `${product.title} built for decision-makers who need a sharper story`;
}

function buildPainPoint(formPainPoint, product) {
  if (formPainPoint.trim()) return formPainPoint.trim();
  return product?.problem || 'Add a prospect pain point to make this one-pager more specific.';
}

function buildCTA(product, formCta) {
  if (formCta.trim()) return formCta.trim();
  return product?.cta?.trim() || 'Schedule a conversation to see if this is the right fit.';
}

function buildOpening(product, prospectCompany) {
  if (!product) return '';
  if (prospectCompany) {
    return `${prospectCompany} needs a practical path to ${product.success?.toLowerCase() || 'better outcomes'}. ${product.title} gives your team a concrete way to get there without adding complexity.`;
  }
  return product.description || '';
}

function buildOutcome(product) {
  if (!product) return '';
  return product.transformation || product.success || '';
}

function BuilderField({ label, children, hint }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-gray-100">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-gray-400">{hint}</span> : null}
    </label>
  );
}

const SC_SERVICES = [
  'Payment Processing & Merchant Services',
  'ATM Management & Cash Access Programs',
  'Loyalty & Rewards Programs',
  'Business Intelligence & Analytics',
  'Fleet & Commercial Fuel Solutions',
];
const SC_BUILT_FOR = [
  'Travel Plazas & Truck Stops',
  'Convenience & Fuel Retailers',
  'Independent Store Operators',
  'Multi-Location Chains',
];
const CC_SERVICES = [
  'ATM Management & Cash Access',
  'Merchant Processing Services',
  'Financial Product Distribution',
  'In-Store Promotions & Loyalty',
];
const CC_BUILT_FOR = [
  'Independent Retailers',
  'Convenience Stores',
  'Hospitality Operators',
  'Regional Chains',
];

function OnePagerBuilderPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      setError('');

      try {
        const data = await listProducts();
        if (cancelled) return;
        setProducts(data || []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Unable to load products right now.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProducts();
    window.scrollTo(0, 0);
    document.title = 'Sales One-Pager Builder - Switch Commerce';

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === form.productId) || null,
    [products, form.productId]
  );

  const theme = BRAND_THEMES[selectedProduct?.company] || BRAND_THEMES['Switch Commerce'];
  const useCases = splitUseCases(selectedProduct?.useCases);
  const keywords = formatKeywords(selectedProduct?.keywords);
  const opening = buildOpening(selectedProduct, form.prospectCompany.trim());
  const painPoint = buildPainPoint(form.painPoint, selectedProduct);
  const callToAction = buildCTA(selectedProduct, form.callToAction);
  const outcome = buildOutcome(selectedProduct);

  const isClearChoice = selectedProduct?.company === 'Clear Choice';
  const p2Services = isClearChoice ? CC_SERVICES : SC_SERVICES;
  const p2BuiltFor = isClearChoice ? CC_BUILT_FOR : SC_BUILT_FOR;
  const p2Headline = isClearChoice
    ? "Clear-cut solutions for today's business."
    : 'Powering smarter commerce for independent operators.';
  const p2Body = isClearChoice
    ? 'Clear Choice delivers straightforward financial services and business solutions that give operators the tools and transparency they need to compete and grow.'
    : 'Switch Commerce is the technology partner for travel plazas, truck stops, and independent operators who want payment, cash, loyalty, and analytics—all from one team that understands their business.';
  const p2Tagline = isClearChoice
    ? 'A Clear Choice for better business outcomes.'
    : 'Commerce technology for operators who mean business.';

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleProductChange(event) {
    const nextId = event.target.value;
    const nextProduct = products.find((product) => product.id === nextId);

    setForm((current) => ({
      ...current,
      productId: nextId,
      callToAction: current.callToAction || nextProduct?.cta?.trim() || '',
    }));
  }

  function resetBuilder() {
    setForm(EMPTY_FORM);
  }

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: letter portrait;
              margin: 0.35in;
            }

            html,
            body {
              background: #ffffff !important;
              color: #0f172a !important;
            }

            nav,
            footer {
              display: none !important;
            }

            .print-hide {
              display: none !important;
            }

            .print-shell {
              display: block !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
            }

            .print-stage {
              max-width: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            .print-layout {
              display: block !important;
            }

            .print-preview {
              width: 100% !important;
              min-width: 0 !important;
            }

            /* ── PAGE 1: force to exactly one printed page ── */

            .one-pager-sheet {
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              margin: 0 !important;
              max-width: none !important;
              width: 100% !important;
              min-height: 0 !important;
              height: 10.3in !important;
              overflow: hidden !important;
              page-break-after: always !important;
              break-after: page !important;
            }

            .one-pager-content {
              padding: 0.19in 0.21in 0.14in !important;
              background: #ffffff !important;
              background-image: none !important;
              height: 100% !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
            }

            .one-pager-header {
              display: grid !important;
              grid-template-columns: minmax(0, 1.7fr) minmax(1.8in, 0.85fr) !important;
              gap: 0.16in !important;
              align-items: start !important;
              padding-bottom: 0.13in !important;
              margin-bottom: 0 !important;
              flex-shrink: 0 !important;
            }

            .one-pager-body {
              display: grid !important;
              grid-template-columns: minmax(0, 1.35fr) minmax(1.8in, 0.82fr) !important;
              gap: 0.14in !important;
              padding-top: 0.13in !important;
              flex: 1 !important;
              min-height: 0 !important;
            }

            .one-pager-main {
              display: flex !important;
              flex-direction: column !important;
              gap: 0.1in !important;
            }

            .one-pager-side {
              display: flex !important;
              flex-direction: column !important;
              gap: 0.1in !important;
            }

            /* knock out the space-y-* margin gaps */
            .one-pager-main > * + *,
            .one-pager-side > * + * {
              margin-top: 0 !important;
            }

            .one-pager-bottom {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 0.1in !important;
              padding-top: 0.1in !important;
              flex-shrink: 0 !important;
            }

            .one-pager-bottom > * + * {
              margin-top: 0 !important;
            }

            /* card / cta / prepared-for padding */
            .one-pager-card {
              padding: 0.1in 0.13in !important;
              break-inside: avoid;
              page-break-inside: avoid;
              box-shadow: none !important;
              border-radius: 10px !important;
            }

            .one-pager-cta {
              padding: 0.1in 0.13in !important;
              break-inside: avoid;
              page-break-inside: avoid;
              border-radius: 10px !important;
            }

            .one-pager-prepared {
              padding: 0.1in 0.13in !important;
              break-inside: avoid;
              page-break-inside: avoid;
              border-radius: 10px !important;
            }

            /* brand logo on page 1 */
            .one-pager-brand-logo {
              padding: 5px 8px !important;
              border-radius: 8px !important;
            }

            .one-pager-brand-logo img {
              height: 22px !important;
              width: auto !important;
            }

            /* internal card spacing */
            .one-pager-sheet .mt-5 { margin-top: 5px !important; }
            .one-pager-sheet .mt-4 { margin-top: 5px !important; }
            .one-pager-sheet .mt-3 { margin-top: 4px !important; }
            .one-pager-sheet .mt-1 { margin-top: 2px !important; }
            .one-pager-sheet .space-y-3 > * + * { margin-top: 4px !important; }
            .one-pager-sheet .gap-2 { gap: 4px !important; }
            .one-pager-sheet .gap-3 { gap: 5px !important; }

            /* typography */
            .one-pager-sheet h2 {
              font-size: 20px !important;
              line-height: 1.1 !important;
              margin-top: 6px !important;
            }

            .one-pager-sheet p,
            .one-pager-sheet span,
            .one-pager-sheet div {
              line-height: 1.28 !important;
            }

            .one-pager-sheet .text-lg { font-size: 12px !important; }
            .one-pager-sheet .text-base { font-size: 11px !important; }
            .one-pager-sheet .text-sm { font-size: 10px !important; }
            .one-pager-sheet .text-xs { font-size: 8px !important; }

            .one-pager-sheet .leading-8,
            .one-pager-sheet .leading-7,
            .one-pager-sheet .leading-6,
            .one-pager-sheet .leading-tight {
              line-height: 1.2 !important;
            }

            .one-pager-sheet * {
              color-adjust: exact;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* ── PAGE 2: brand + contact sheet ── */

            .print-page2 {
              margin: 0 !important;
              max-width: none !important;
              width: 100% !important;
              height: 10.3in !important;
              overflow: hidden !important;
              page-break-before: always !important;
              break-before: page !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }

            .print-page2 * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      <div className="print-shell flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(9,81,250,0.20),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(255,79,0,0.20),_transparent_34%),linear-gradient(180deg,_#111827_0%,_#0b1020_100%)] text-white">
        <div className="print-hide max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
          <Link
            to="/print-collateral"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Print Collateral
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-gray-300">
                Sales one-pager builder
              </div>
              <h1 className={`mt-5 font-switch-bold text-4xl sm:text-5xl bg-gradient-to-r ${theme.heading} bg-clip-text text-transparent`}>
                Build a tailored leave-behind for the next prospect conversation.
              </h1>
              <p className="mt-4 max-w-3xl text-base sm:text-lg text-gray-300">
                Choose a product, add the prospect context, and generate a polished one-page story your rep can print or save as PDF.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Output</p>
                  <p className="text-sm text-gray-400">2-page print: one-pager + brand contact sheet</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={!selectedProduct}
                  className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-700 ${theme.button}`}
                >
                  Print one-pager
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="print-stage max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="print-layout grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)] xl:items-start">
            <section className="print-hide rounded-[28px] border border-white/10 bg-[#081121]/90 p-6 shadow-2xl backdrop-blur-md xl:sticky xl:top-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-switch-bold text-white">Customize the story</h2>
                  <p className="mt-1 text-sm text-gray-400">The preview updates as you type.</p>
                </div>
                <button
                  type="button"
                  onClick={resetBuilder}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>

              {isLoading ? (
                <div className="mt-8 flex items-center gap-3 text-gray-300">
                  <div className="inline-block h-6 w-6 border-4 border-[#0951fa] border-t-transparent rounded-full animate-spin"></div>
                  Loading products...
                </div>
              ) : error ? (
                <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                  {error}
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <BuilderField label="Product">
                    <select
                      value={form.productId}
                      onChange={handleProductChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                    >
                      <option value="" className="text-gray-900">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id} className="text-gray-900">
                          {product.title} · {product.company}
                        </option>
                      ))}
                    </select>
                  </BuilderField>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <BuilderField label="Prospect name">
                      <input
                        value={form.prospectName}
                        onChange={(event) => updateField('prospectName', event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                        placeholder="Jordan Thomas"
                      />
                    </BuilderField>

                    <BuilderField label="Prospect company">
                      <input
                        value={form.prospectCompany}
                        onChange={(event) => updateField('prospectCompany', event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                        placeholder="Northside Travel Plaza"
                      />
                    </BuilderField>
                  </div>

                  <BuilderField label="Pain point" hint="Leave blank to use the product's default pain statement.">
                    <textarea
                      rows={4}
                      value={form.painPoint}
                      onChange={(event) => updateField('painPoint', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                      placeholder="Their locations are losing cash access revenue because the current equipment keeps going down."
                    />
                  </BuilderField>

                  <BuilderField label="Call to action" hint="Override the product CTA if this prospect needs a different next step.">
                    <textarea
                      rows={3}
                      value={form.callToAction}
                      onChange={(event) => updateField('callToAction', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                      placeholder="Schedule a 15-minute review of their current program and rollout timing."
                    />
                  </BuilderField>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <BuilderField label="Rep name">
                      <input
                        value={form.repName}
                        onChange={(event) => updateField('repName', event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                        placeholder="Avery Cole"
                      />
                    </BuilderField>

                    <BuilderField label="Rep title">
                      <input
                        value={form.repTitle}
                        onChange={(event) => updateField('repTitle', event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                        placeholder="Senior Account Executive"
                      />
                    </BuilderField>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <BuilderField label="Rep email">
                      <input
                        value={form.repEmail}
                        onChange={(event) => updateField('repEmail', event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                        placeholder="avery@switchcommerce.com"
                      />
                    </BuilderField>

                    <BuilderField label="Rep phone">
                      <input
                        value={form.repPhone}
                        onChange={(event) => updateField('repPhone', event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                        placeholder="(555) 555-0123"
                      />
                    </BuilderField>
                  </div>
                </div>
              )}
            </section>

            <section className="print-preview min-w-0">
              {/* ── Page 1: One-Pager ── */}
              <div className="one-pager-sheet mx-auto min-h-[1056px] max-w-[816px] overflow-hidden rounded-[32px] border border-black/10 bg-[#fcfbf8] text-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.35)]">
                <div
                  className="one-pager-content px-8 pb-8 pt-8 sm:px-10"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.accentStrong} 0%, rgba(252,251,248,0.9) 34%, rgba(252,251,248,1) 100%)`,
                  }}
                >
                  <div className="one-pager-header flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-8">
                    <div className="max-w-2xl">
                      <div
                        className="one-pager-brand-logo inline-flex items-center rounded-xl px-3 py-2"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <img
                          src={isClearChoice
                            ? '/logos/clearchoice/Logo Main/CC Logo Full White.png'
                            : '/logos/switch/Logo Stacked/SC Logo Stacked large - White.png'}
                          alt={theme.badge}
                          className="h-9 object-contain"
                        />
                      </div>
                      <h2 className="mt-5 text-4xl font-switch-bold leading-tight text-slate-950 sm:text-[2.65rem]">
                        {buildHeadline(selectedProduct, form.prospectName.trim())}
                      </h2>
                      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
                        {opening || 'Select a product to start building a customized prospect-facing page.'}
                      </p>
                    </div>

                    <div className="one-pager-prepared min-w-[220px] rounded-[24px] border border-slate-200 bg-white/80 p-5 backdrop-blur-sm">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Prepared for</div>
                      <div className="mt-3 text-lg font-semibold text-slate-950">
                        {form.prospectName.trim() || 'Prospect name'}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {form.prospectCompany.trim() || 'Prospect company'}
                      </div>
                      <div className="mt-5 h-px bg-slate-200"></div>
                      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Prepared by</div>
                      <div className="mt-3 text-sm font-semibold text-slate-900">
                        {form.repName.trim() || 'Your rep'}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">{form.repTitle.trim() || 'Title'}</div>
                      <div className="mt-4 space-y-1 text-sm text-slate-700">
                        {form.repEmail.trim() ? <div>{form.repEmail.trim()}</div> : null}
                        {form.repPhone.trim() ? <div>{form.repPhone.trim()}</div> : null}
                      </div>
                    </div>
                  </div>

                  <div className="one-pager-body grid gap-8 pt-8 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="one-pager-main space-y-7">
                      <div className="one-pager-card rounded-[26px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">The situation</div>
                        <p className="mt-3 text-base leading-7 text-slate-800">{painPoint}</p>
                        {selectedProduct?.villain ? (
                          <div className="mt-5 rounded-[20px] bg-slate-950 px-5 py-4 text-sm text-slate-100">
                            <span className="font-semibold text-white">What gets in the way:</span> {selectedProduct.villain}
                          </div>
                        ) : null}
                      </div>

                      <div className="one-pager-card rounded-[26px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">The plan</div>
                        <p className="mt-3 text-lg font-semibold leading-8 text-slate-950">
                          {selectedProduct?.plan || 'Pick a product to pull in the recommended approach.'}
                        </p>
                        {selectedProduct?.description ? (
                          <p className="mt-4 text-sm leading-7 text-slate-700">{selectedProduct.description}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="one-pager-side space-y-6">
                      <div className="one-pager-card rounded-[26px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Best fit</div>
                        <div className="mt-4 space-y-3">
                          {useCases.length ? useCases.map((item) => (
                            <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-800">
                              <span
                                className="mt-1.5 h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: theme.accent }}
                              ></span>
                              <span>{item}</span>
                            </div>
                          )) : (
                            <p className="text-sm leading-6 text-slate-600">Use cases will appear once a product is selected.</p>
                          )}
                        </div>
                      </div>

                      <div className="one-pager-card rounded-[26px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Talking points</div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {keywords.length ? keywords.map((item) => (
                            <span
                              key={item}
                              className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]"
                              style={{
                                color: theme.accent,
                                backgroundColor: theme.accentSoft,
                              }}
                            >
                              {item}
                            </span>
                          )) : (
                            <span className="text-sm text-slate-600">Keywords and tags will appear here.</span>
                          )}
                        </div>
                      </div>

                      <div
                        className="one-pager-cta rounded-[28px] px-6 py-6 text-white shadow-lg"
                        style={{ background: `linear-gradient(145deg, ${theme.accent} 0%, #111827 85%)` }}
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Next step</div>
                        <p className="mt-4 text-lg font-semibold leading-8">{callToAction}</p>
                      </div>
                    </div>
                  </div>

                  <div className="one-pager-bottom grid gap-6 pt-6 sm:grid-cols-2">
                    <div className="one-pager-card rounded-[26px] border border-slate-200 bg-white px-6 py-6 shadow-sm h-full">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Success looks like</div>
                      <p className="mt-3 text-base leading-7 text-slate-800">
                        {selectedProduct?.success || 'Choose a product to populate the outcome story.'}
                      </p>
                    </div>
                    <div className="one-pager-card rounded-[26px] border border-slate-200 bg-white px-6 py-6 shadow-sm h-full">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Transformation</div>
                      <p className="mt-3 text-base leading-7 text-slate-800">
                        {outcome || 'Your one-pager will summarize the before-and-after change.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen divider between page previews */}
              <div className="print-hide mt-6 mb-4 flex items-center gap-3 max-w-[816px] mx-auto">
                <div className="h-px flex-1 bg-white/10"></div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                  Page 2 · Brand &amp; Contact
                </span>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>

              {/* ── Page 2: Brand + Contact Sheet ── */}
              <div
                className="print-page2 mx-auto max-w-[816px] overflow-hidden rounded-[32px] border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)]"
                style={{
                  background: `linear-gradient(145deg, ${theme.accent} 0%, #0b1020 65%)`,
                  color: 'white',
                  minHeight: '900px',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0.45in 0.5in 0.38in',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                {/* Body */}
                <div style={{ flex: 1 }}>
                  <img
                    src={isClearChoice
                      ? '/logos/clearchoice/Logo Main/CC Logo Full White.png'
                      : '/logos/switch/Logo Stacked/SC Logo Stacked large - White.png'}
                    alt={theme.badge}
                    style={{ height: '52px', objectFit: 'contain', display: 'block', marginBottom: '22px' }}
                  />

                  <h2
                    className="font-switch-bold"
                    style={{ fontSize: '40px', lineHeight: '1.1', margin: '0 0 18px', maxWidth: '5.4in', color: 'white' }}
                  >
                    {p2Headline}
                  </h2>

                  <p style={{ fontSize: '15px', lineHeight: '1.65', maxWidth: '5.3in', opacity: 0.85, margin: '0 0 42px' }}>
                    {p2Body}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.55in' }}>
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '14px' }}>
                        What we offer
                      </div>
                      {p2Services.map((item) => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '13px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.65)', flexShrink: 0 }} />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div>
                      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '14px' }}>
                        Built for
                      </div>
                      {p2BuiltFor.map((item) => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '13px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.65)', flexShrink: 0 }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    paddingTop: '22px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <div>
                    <img
                      src={isClearChoice
                        ? '/logos/clearchoice/Logo Main/CC Logo Full White.png'
                        : '/logos/switch/Logo Stacked/SC Logo Stacked large - White.png'}
                      alt={theme.badge}
                      style={{ height: '30px', objectFit: 'contain', display: 'block', marginBottom: '8px' }}
                    />
                    <div style={{ fontSize: '13px', opacity: 0.6 }}>{p2Tagline}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '13px', opacity: 0.75 }}>
                    <div style={{ marginBottom: '5px' }}>switchcommerce.team</div>
                    {form.repEmail.trim() ? (
                      <div style={{ marginBottom: '4px' }}>{form.repEmail.trim()}</div>
                    ) : null}
                    {form.repPhone.trim() ? <div>{form.repPhone.trim()}</div> : null}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default OnePagerBuilderPage;
