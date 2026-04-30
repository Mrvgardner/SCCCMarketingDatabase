import{r as i,j as e,L as u}from"./main-3b79c019.js";const c=`
  #lumio-form {
    font-family: inherit;
    color: #f3f4f6;
  }
  #lumio-form h1,
  #lumio-form h2,
  #lumio-form h3 {
    display: none;
  }
  #lumio-form > p,
  #lumio-form form > p,
  #lumio-form > div > p:first-child {
    display: none;
  }
  #lumio-form label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #d1d5db;
    margin-bottom: 0.375rem;
  }
  #lumio-form input[type="text"],
  #lumio-form input[type="email"],
  #lumio-form input[type="date"],
  #lumio-form input[type="url"],
  #lumio-form textarea,
  #lumio-form select {
    width: 100%;
    background: rgba(31, 41, 55, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    color: #f9fafb;
    font-size: 0.875rem;
    font-family: inherit;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
    appearance: none;
    -webkit-appearance: none;
    color-scheme: dark;
  }
  #lumio-form input::placeholder,
  #lumio-form textarea::placeholder {
    color: #6b7280;
  }
  #lumio-form input:focus,
  #lumio-form textarea:focus,
  #lumio-form select:focus {
    outline: none;
    border-color: rgba(147, 51, 234, 0.6);
    box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.15);
  }
  #lumio-form textarea {
    resize: vertical;
    min-height: 120px;
  }
  #lumio-form select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    padding-right: 2.5rem;
    cursor: pointer;
  }
  #lumio-form select option {
    background: #1f2937;
    color: #f9fafb;
  }
  #lumio-form button[type="submit"],
  #lumio-form input[type="submit"],
  #lumio-form .lumio-submit,
  #lumio-form button:not([type]) {
    width: 100%;
    background: linear-gradient(135deg, #9333ea, #7c22d4);
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9375rem;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    margin-top: 0.5rem;
    font-family: inherit;
    box-shadow: 0 4px 20px rgba(147, 51, 234, 0.25);
  }
  #lumio-form button[type="submit"]:hover,
  #lumio-form input[type="submit"]:hover,
  #lumio-form button:not([type]):hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  #lumio-form button[type="submit"]:active,
  #lumio-form input[type="submit"]:active {
    transform: translateY(0);
  }
  #lumio-form > div,
  #lumio-form form > div {
    margin-bottom: 1.25rem;
  }
  #lumio-form .lumio-powered,
  #lumio-form [class*="powered"] {
    color: #4b5563;
    font-size: 0.75rem;
    text-align: right;
    margin-top: 1rem;
  }
  #lumio-form .lumio-error,
  #lumio-form [class*="error"] {
    color: #f87171;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  #lumio-form .lumio-success,
  #lumio-form [class*="success"] {
    color: #86efac;
  }
`;function d(){return e.jsxs("div",{className:"flex flex-col items-center justify-center py-16 gap-4",children:[e.jsx("div",{className:"h-8 w-8 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin"}),e.jsx("p",{className:"text-sm text-gray-400",children:"Loading Request Form"})]})}function p(){const r=i.useRef(null),[n,l]=i.useState(!1);return i.useEffect(()=>{document.title="Marketing Request Form - Switch Commerce"},[]),i.useEffect(()=>{const m=document.createElement("style");m.textContent=c,document.head.appendChild(m);const t=document.getElementById("lumio-form"),s=new MutationObserver(()=>{t&&t.children.length>0&&(l(!0),s.disconnect())});t&&s.observe(t,{childList:!0,subtree:!0});const o=document.createElement("script");return o.src=`https://lumioboards.netlify.app/embed.js?v=${Date.now()}`,o.setAttribute("data-form","marketing-requests-7proue"),o.setAttribute("data-target","#lumio-form"),o.async=!0,r.current.appendChild(o),()=>{var a;s.disconnect(),document.head.removeChild(m),(a=r.current)!=null&&a.contains(o)&&r.current.removeChild(o)}},[]),e.jsxs("div",{className:"flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white",children:[e.jsx("div",{className:"py-6 sm:py-10 px-4",children:e.jsxs("div",{className:"max-w-3xl mx-auto",children:[e.jsxs(u,{to:"/",className:"inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm",children:[e.jsx("svg",{className:"w-4 h-4 mr-1.5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M10 19l-7-7m0 0l7-7m-7 7h18"})}),"Back to Home"]}),e.jsx("h1",{className:"font-switch-bold text-2xl sm:text-3xl mb-2 bg-gradient-to-r from-[#9333ea] to-[#c084fc] bg-clip-text text-transparent",children:"Marketing Request"}),e.jsx("p",{className:"text-sm text-gray-400 max-w-2xl",children:"Submit your requests and our team will get back to you promptly."})]})}),e.jsx("div",{className:"max-w-3xl mx-auto px-4 pb-16",children:e.jsxs("div",{className:"rounded-2xl bg-gray-900/40 border border-white/10 backdrop-blur-md p-6 sm:p-8 shadow-xl",children:[!n&&e.jsx(d,{}),e.jsx("div",{ref:r,style:n?void 0:{display:"none"},children:e.jsx("div",{id:"lumio-form"})})]})}),e.jsx("div",{className:"max-w-3xl mx-auto px-4 py-8 text-center text-gray-400 text-sm",children:e.jsxs("p",{children:["Questions? ",e.jsx("a",{href:"mailto:marketing@switchcommerce.com",className:"text-gray-200 hover:text-white underline transition-colors",children:"Contact the marketing team"})," directly."]})})]})}export{p as default};
