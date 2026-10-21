# React frontend structure

The frontend uses a feature-based structure with shared UI components. Start in `src/main.tsx`, which mounts `app/App.tsx`.

```text
src/
  app/
    App.tsx                 # Providers and authenticated entry point
  components/
    layout/                 # AppLayout, PageHeading
    ui/                     # Modal, ErrorAlert, SuccessNotice
  features/
    auth/                   # AuthProvider, useAuth, LoginPage
    books/components/       # Catalog, cards, dialogs, forms, book details
    library/
      LibraryPage.tsx       # Workspace composition and user actions
      api.ts                # Typed catalog, inventory and loan API operations
      hooks/                # useLibraryData: fetching, filters and refresh
      components/           # Library statistics
    loans/components/       # LoanHistory and return actions
  lib/
    api-client.ts           # HTTP client, bearer header and error handling
  styles/
    globals.css             # Existing shared responsive styles
  types/
    library.ts              # Shared domain and API response types
  vite-env.d.ts             # Vite asset/CSS type declarations
```

## Where code belongs

- Keep `main.tsx` limited to mounting React and importing global CSS.
- Add domain-specific UI under its feature. Share components through `components/ui` only when multiple features use them.
- Keep HTTP mechanics in `lib/api-client.ts`; put endpoint-specific operations in the feature API module.
- `AuthProvider` owns session storage, current-user restoration and sign-out. Components consume `useAuth()`.
- `useLibraryData` owns query state, debounced fetching, cancellation and refresh. Components receive data and callback props.
- `LibraryPage` coordinates mutations and notifications. Book forms own their input state and call parent callbacks to save.
- Use typed props and `import type` for domain contracts. Keep styles centralized until a feature needs its own CSS module.

No new state-management or routing dependencies were introduced. React Context handles authentication; hooks handle workspace state. The existing tab navigation and appearance are retained.

## Verification

Run `npm run build` from `frontend`. For additional checks:

```sh
npx tsc --noEmit --noUncheckedSideEffectImports --noUnusedLocals --noUnusedParameters
```
