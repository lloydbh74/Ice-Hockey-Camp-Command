# Swedish Camp Command: User Journey

This document narrates the end-to-end user experience of the Swedish Camp Command system, weaving together the technical specifications into a cohesive story. It illustrates how Organisers, Guardians, and Coaches interact with the application.

## Characters

- **Bjorn (Organiser)**: Administrator of the camp, needs efficiency and oversight.
- **Sarah (Guardian)**: Parent of a hockey-mad kid, busy, needs a friction-free experience.
- **Leo (Player)**: Sarah's son, the participant.
- **Sven (Coach)**: On-ice instructor, needs quick access to information.

---

## Act 1: The Setup (Organiser)

It's January. **Bjorn** logs into the **Swedish Camp Command Admin Dashboard**. He needs to set up the camps for the upcoming summer.
1.  He navigates to **Settings > Camps** and creates a new camp: "Summer Smash 2026".
2.  He goes to **Products** and ensures "High Performance Camp (Week 1)" is listed.
3.  He links the product to the camp, setting the price.
4.  He configures the **Reminder Settings** for this camp: he decides on a gentle nudge after 3 days, and a firmer reminder 7 days after the initial invite.

The system is now ready to catch incoming orders.

## Act 2: The Purchase & Ingestion (System Automation)

**Sarah** visits the public camp website (external to this app) and buys a spot for **Leo** in the "Summer Smash 2026" camp. She pays via the webshop.
1.  She receives a generic order confirmation email.
2.  Behind the scenes, **The System** (via n8n) intercepts this email.
3.  It parses details: Sarah's email, the product SKU ("Summer Smash"), and the order ID.
4.  The **Ingestion API** receives this package. It checks the database:
    - Does Sarah exist as a `Guardian`? No, so it creates her record.
    - Does this order exist? No, so it creates a `Purchase` record with a status of `uninvited`.

## Act 3: The Invitation (Guardian)

A few minutes later, the separate **Invitation & Reminder Engine** runs its scheduled reporting check.
1.  It spots Sarah's new `uninvited` purchase.
2.  It generates a secure, unique **Magic Link** token.
3.  It dispatches a friendly email to Sarah: *"Action Required: Complete Leo's Registration for Summer Smash 2026"*.
4.  The purchase status updates to `invited`.

**Sarah** opens the email on her phone. She clicks the button.
- No password to remember.
- No "create account" friction.
- She lands directly on a branded **Registration Page** for her specific purchase.

## Act 4: The Registration (Guardian)

The form greets her. "Completing registration for order #1234".
1.  She enters **Leo's** details: Date of Birth, Playing Position (Goalie), and standard Medical Info.
2.  She selects his **Kit Order**: A "Large" Jersey and "Medium" Shorts. She adds "LEO THE LION" for the custom name print.
3.  She hits **Submit**.

The system creates the `Player`, `Registration`, and `KitOrder` records. The purchase status flips to `completed`. Sarah gets a "See you at the rink!" confirmation screen.

*Alternate Reality*: If Sarah had forgotten to click the link, the **Reminder Engine** would have woken up 3 days later, checked her status was still `invited`, and sent her a polite nudge automatically, exactly as Bjorn configured.

## Act 5: The Overview (Organiser)

Back in the command center, **Bjorn** checks the **Organiser Dashboard**.
1.  He sees the "Summer Smash 2026" stats have updated: *150 Purchases, 1 Registration Completed*.
2.  He clicks into **Kit Orders** and sees 1 Jersey (Large) needed. He can export this to CSV for the supplier later.
3.  He checks the **Daily Attendance** view for the first day of camp. Leo is listed there, with a note about his peanut allergy (pulled from medical info).

## Act 6: The Day Planner (Organiser)

As the camp approaches, Bjorn needs to schedule the chaos.
1.  He opens the **Camp Day Planner**.
2.  He defines the camp days: Monday through Friday.
3.  For Monday, he drags a "On-Ice Skills" block onto the timeline from 09:00 to 10:30.
4.  He assigns it to the "Elite" stream.
5.  He notices a conflict—the "Beginners" stream is also on the ice at 09:00. He drags the Elite session to 10:30. The system saves the changes instantly.

## Act 7: The Camp Day (Coach)

It's Monday morning. **Sven**, the coach, is already at the rink.
1.  He doesn't have admin access, but he has the **Coach View** link saved on his phone home screen.
2.  He opens it and selects "Elite Stream".
3.  He sees a clean, read-only timeline: *09:00 - Off-Ice Warmup*, *10:30 - On-Ice Skills*.
4.  He knows exactly where to be.

---

**End of User Journey**
