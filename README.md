# Reverse Reparations
**Live site:** https://jc0h3n.github.io/reverse-reparations/

A one-page visualization of the reparations that ran from the colonized to the colonizers, following Antony Anghie, "The Injustices of Reparations," 119 *American Journal of International Law* 423 (2025), [doi:10.1017/ajil.2025.10078](https://doi.org/10.1017/ajil.2025.10078).

It covers four strands:

1. **Reverse colonial reparations.** The Treaty of Nanking (1842), Haiti's independence indemnity (1825), British slave-owner compensation (1833–2015), and Indonesia's independence debt (1949).
2. **Corporate reparations.** Investor–state arbitration, set against everything the International Court of Justice has ever ordered states to pay (from the companion site [What the Court Ordered](https://jc0h3n.github.io/icj-remedies/)).
3. **Claims for colonial reparations.** Nauru v. Australia, the Herero and Nama genocide, and CARICOM's 10-point plan.
4. **Sovereign debt.**

Every figure lives in `site/data.json` with its source. The article is summarized in our own words, not reproduced.

Where sources disagree with the article, the page says so:
- The Rockhopper award was in euros, and it was annulled in 2025.
- Sources give Indonesia's debt as either 4.3 or 4.5 billion guilders.

Amounts are not converted between currencies or eras unless a cited source does so.

## Running it locally

```
node scripts/serve.mjs   # http://localhost:8080
```
