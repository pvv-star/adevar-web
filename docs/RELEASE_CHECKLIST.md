# Release Checklist

1. `npm run check:env`
2. `npm run lint`
3. `npm run build`
4. `ADEVAR_BASE_URL=https://www.adevar.ai npm run smoke:prod`
5. Verify DB checks (inflation points > 0)
6. Deploy (`vercel --prod`)
7. Re-run production smoke
8. Post in PR: commit hash + smoke output + deploy URL
