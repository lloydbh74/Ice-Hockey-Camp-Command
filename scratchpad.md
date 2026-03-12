Camp schedule, colour code sessions, add colour picker in edit settings. Only allow colours that match the style guide.

Confirm chase all doesn't chase registrants in archived camps. Can it only chase those in the flitered registration list?


Review the latest code changes for regression, cleanliness, optimisation and security. Evaluate every touch point in the code the new changes interact with 


Perform a final, "zero-failure" audit of the latest code changes. Do not allow a push to the repository if any of the following criteria are failed. 
Phase 1: Technical & Security AuditLogic & Regressions: Identify every touchpoint where new changes interact with existing modules. Highlight potential side effects or "ripple" bugs.Security: Check for XSS, CSRF, or insecure data handling in both Frontend and Backend.Performance: Audit for inefficient loops, unnecessary re-renders, or heavy payloads.
Phase 2: UI & WCAG 2.1 AA Compliance Semantic HTML: Ensure correct use of landmarks (header, main, nav) and heading levels ($H1$ through $H6$).Interactivity: Verify that all new components are fully keyboard-navigable (Tab order, Focus states).Attributes: Check for missing aria-labels, alt text, and associated form labels.Visuals: Audit colour contrast ratios (minimum 4.5:1 for normal text) and ensure no information is conveyed by colour alone.
Phase 3: Adversarial ReviewIdentify three edge cases where these changes will break for a user—one for a screen reader user, one for a mobile user, and one for a low-bandwidth user.Final Output: Provide a "Go/No-Go" status. For every "No-Go," provide the file name, line number, and the specific WCAG success criterion or logic principle violated.

Once done push to the repo, using /deploy please.



### Purchases Not Reflected in App Database (Audit 2026-03-06)
Total Missing Rows: 16 (representing ~15 Orders)

1.  #12076 | Mark Telford | marktelford1966@gmail.com | HCS-ADULT & HCS-ADV-ELITE
2.  #12087 | Vikki Hoggins | hoggins83@gmail.com | HCS-ADV-PRO
3.  #12092 | Stuart Mason | mason89s@icloud.com | HCS-ADULT
4.  #12093 | Nerissa Chau | nerissa_sa@hotmail.com | HCS-NYLANDER
5.  #12094 | David Abbott | davidabbott1985@hotmail.com | HCS-KEMPE
6.  #12095 | David Abbott | davidabbott1985@hotmail.com | HCS-ADULT
7.  #12096 | Vit Prucha | matyas@doprdele.cz | HCS-NYLANDER
8.  #12097 | Shaun Wheeler | shaun.a.wheeler@icloud.com | HCS-NYLANDER
9.  #0     | Henry Peckham | hpeckham@hotmail.co.uk | HCS-NYLANDER (Status: PROBLEM)**
10. #12098 | Nicholas Cooper | n_cooper@blueyonder.co.uk | HCS-NYLANDER
11. #12099 | Stacey Bolandi | staceyblainey@hotmail.com | HCS-KEMPE
12. #12100 | Kevin Broder | kevinbroder81@gmail.com | HCS-ADV-PRO
13. #12101 | Lara Murray | laramurray71@gmail.com | HCS-NYLANDER
14. #12102 | Alan Gilroy | alangilroy81@gmail.com | HCS-KEMPE
15. #12103 | Thomas Hiles | tomhiles@gmail.com | HCS-ADV-PRO
16. #12104 | Alec Bale | apbale@outlook.com | HCS-NYLANDER