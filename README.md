# Facelove Shopify theme

A native Liquid product page built on Shopify Horizon 4.5.0 for the Facelove trial.

- Store: `paoloarroyo-test-fmqy72z7.myshopify.com`
- Product: `/products/changing-foundation-stick-landing`
- Product template: `templates/product.facelove.json`
- Branch intended for Shopify integration: `main`

## Development

The repository root is the theme root. No build step is required for Shopify.

```sh
shopify theme dev --store paoloarroyo-test-fmqy72z7.myshopify.com
shopify theme check
```

Product records, metafields, uploaded photos and videos live in Shopify and are not embedded in this repository. The theme references the existing test-store resources. Local screenshots, research reports, generated ZIPs and dependencies are excluded from Git.

## History

The implementation was developed on November 12–14, 2026 before Git was initialized. This commit history was reconstructed afterward from saved source checkpoints and grouped by feature. Commit timestamps record the reconstruction; they are not a contemporaneous record of the original sessions. See [HISTORY.md](HISTORY.md) for checkpoint provenance.

## Shopify connection

The store owner will connect `juppy-dev/facelove`, branch `main`, through Online Store > Themes > Add theme > Connect from GitHub. GitHub integration has not been configured by this repository setup.

Shopify's integration creates a connected theme in the theme library. Preview it, then publish that connected theme when ready. Once connected, pull Shopify's theme-editor commits before making local changes.

The original Shopify license is preserved in [LICENSE.md](LICENSE.md).
