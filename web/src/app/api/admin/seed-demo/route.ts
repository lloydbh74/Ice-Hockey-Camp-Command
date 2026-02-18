import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'edge';

// ─── Fictional Demo Data ─────────────────────────────────────────────
// All PII replaced. Medical patterns preserved for testing.

interface DemoEntry {
    gEmail: string; gName: string;
    first: string; last: string; dob: string; sex: string;
    club: string; ageGroup: string; exp: string; pos: string; level: string;
    product: 'HTH' | 'SS';
    jerseySize: string; jerseyType: string; personalization: string; tshirtSize: string;
    state: 'completed' | 'invited' | 'in_progress' | 'uninvited';
    medNotes?: string; condNotes?: string;
    asthma?: boolean; diabetes?: boolean; concussion?: boolean; brokenBones?: boolean;
    adhd?: boolean; surgery?: boolean;
}

const ENTRIES: DemoEntry[] = [
    // ─── Hat-Trick Heroes (37 registrations) ───
    { gEmail: 'anna.lindqvist@demo.test', gName: 'Anna Lindqvist', first: 'Axel', last: 'Lindqvist', dob: '2016-10-05', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '2+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: '130', jerseyType: 'Player', personalization: 'AXEL 33', tshirtSize: 'L', state: 'completed' },
    { gEmail: 'sofia.andersson@demo.test', gName: 'Sofia Andersson', first: 'Leo', last: 'Andersson', dob: '2015-10-16', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: '130', jerseyType: 'Player', personalization: 'LEO 94', tshirtSize: 'Jr S', state: 'completed' },
    { gEmail: 'maria.eriksson@demo.test', gName: 'Maria Eriksson', first: 'Ella', last: 'Eriksson', dob: '2016-04-09', sex: 'Female', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'ELLA 86', tshirtSize: 'Jr S', state: 'completed' },
    { gEmail: 'karin.pettersson@demo.test', gName: 'Karin Pettersson', first: 'Olivia', last: 'Pettersson', dob: '2012-07-05', sex: 'Female', club: 'Chelmsford', ageGroup: 'U14', exp: '2+ Years', pos: 'Left Wing', level: 'Club', product: 'HTH', jerseySize: 'M', jerseyType: 'Player', personalization: 'PETTERSSON 67', tshirtSize: 'M', state: 'completed', concussion: true, medNotes: 'Mild concussion May 2024' },
    { gEmail: 'ingrid.svensson@demo.test', gName: 'Ingrid Svensson', first: 'Maja', last: 'Svensson', dob: '2014-08-09', sex: 'Female', club: 'Chelmsford', ageGroup: 'U12', exp: '2+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'MAJA 42', tshirtSize: 'Jr XL', state: 'completed' },
    { gEmail: 'sara.larsson@demo.test', gName: 'Sara Larsson', first: 'William', last: 'Larsson', dob: '2015-11-29', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '3+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: '130', jerseyType: 'Player', personalization: 'LARSSON 3', tshirtSize: 'Jr XL', state: 'completed' },
    { gEmail: 'kristina.holm@demo.test', gName: 'Kristina Holm', first: 'Oscar', last: 'Holm', dob: '2015-10-10', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: 'S', jerseyType: 'Player', personalization: 'OSCAR 24', tshirtSize: 'Jr L', state: 'completed' },
    { gEmail: 'magnus.nystrom@demo.test', gName: 'Magnus Nyström', first: 'Saga', last: 'Nyström', dob: '2014-11-08', sex: 'Female', club: 'Chelmsford', ageGroup: 'U12', exp: '3+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'SAGA 92', tshirtSize: 'Jr S', state: 'completed', brokenBones: true, medNotes: 'Broken scapula 2023' },
    { gEmail: 'henrik.forsberg@demo.test', gName: 'Henrik Forsberg', first: 'Emil', last: 'Forsberg', dob: '2016-04-09', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '3+ Years', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: '130', jerseyType: 'Player', personalization: 'FORSBERG 39', tshirtSize: 'Jr L', state: 'completed' },
    { gEmail: 'fredrik.lindberg@demo.test', gName: 'Fredrik Lindberg', first: 'Hugo', last: 'Lindberg', dob: '2014-07-17', sex: 'Male', club: 'Chelmsford', ageGroup: 'U12', exp: '3+ Years', pos: 'Right Wing', level: 'Club', product: 'HTH', jerseySize: 'M', jerseyType: 'Player', personalization: 'LINDBERG 58', tshirtSize: 'S', state: 'completed' },
    { gEmail: 'katarina.bjork@demo.test', gName: 'Katarina Björk', first: 'Liam', last: 'Björk', dob: '2015-04-07', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '2+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: 'S', jerseyType: 'Player', personalization: 'BJORK 23', tshirtSize: 'M', state: 'completed', brokenBones: true, medNotes: 'Fractured right elbow' },
    { gEmail: 'nils.wikstrom@demo.test', gName: 'Nils Wikström', first: 'Filip', last: 'Wikström', dob: '2016-09-15', sex: 'Male', club: 'Invicta', ageGroup: 'U10', exp: '3+ Years', pos: 'Forward', level: 'Conference', product: 'HTH', jerseySize: '120', jerseyType: 'Player', personalization: 'FILIP 22', tshirtSize: 'Jr M', state: 'completed', asthma: true, condNotes: 'Mild asthma, reliever as required' },
    { gEmail: 'emma.gustafsson@demo.test', gName: 'Emma Gustafsson', first: 'Elias', last: 'Gustafsson', dob: '2015-06-01', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '2+ Years', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: 'S', jerseyType: 'Player', personalization: 'GUSTAFSSON 76', tshirtSize: 'L', state: 'completed' },
    { gEmail: 'louise.stromberg@demo.test', gName: 'Louise Strömberg', first: 'Noah', last: 'Strömberg', dob: '2015-03-10', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '3+ Years', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'STROMBERG 4', tshirtSize: 'Jr M', state: 'completed', medNotes: 'Previously had atrial septal defect (hole in heart)' },
    { gEmail: 'karolina.berg@demo.test', gName: 'Karolina Berg', first: 'Alexander', last: 'Berg', dob: '2011-09-29', sex: 'Male', club: 'Romford', ageGroup: 'U14', exp: '2+ Years', pos: 'Right Wing', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'BERG 87', tshirtSize: 'Jr L', state: 'completed' },
    { gEmail: 'chantel.dahl@demo.test', gName: 'Chantel Dahl', first: 'Lucas', last: 'Dahl', dob: '2014-01-09', sex: 'Male', club: 'Romford', ageGroup: 'U12', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: 'S', jerseyType: 'Player', personalization: 'DAHL 14', tshirtSize: 'Jr XL', state: 'completed' },
    { gEmail: 'daniel.ekstrom@demo.test', gName: 'Daniel Ekström', first: 'Elias', last: 'Ekström', dob: '2014-12-20', sex: 'Male', club: 'Guildford', ageGroup: 'U12', exp: '2+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: 'M', jerseyType: 'Player', personalization: 'EKSTROM 29', tshirtSize: 'S', state: 'completed' },
    { gEmail: 'charlotte.bergman@demo.test', gName: 'Charlotte Bergman', first: 'Wilma', last: 'Bergman', dob: '2016-04-11', sex: 'Female', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: 'S', jerseyType: 'Player', personalization: 'WILMA', tshirtSize: 'Jr L', state: 'completed' },
    { gEmail: 'samantha.sjostrom@demo.test', gName: 'Samantha Sjöström', first: 'Noel', last: 'Sjöström', dob: '2013-07-11', sex: 'Male', club: 'Invicta', ageGroup: 'U12', exp: '2+ Years', pos: 'Right Wing', level: 'Club', product: 'HTH', jerseySize: 'L', jerseyType: 'Player', personalization: 'SJOSTROM 40', tshirtSize: 'Jr L', state: 'completed', diabetes: true, condNotes: 'Type 1 diabetic — parent will manage medical needs' },
    { gEmail: 'fay.lindgren@demo.test', gName: 'Fay Lindgren', first: 'Astrid', last: 'Lindgren', dob: '2011-08-11', sex: 'Female', club: 'Invicta', ageGroup: 'U14', exp: '6+ Months', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: 'XL', jerseyType: 'Player', personalization: 'LINDGREN 11', tshirtSize: 'XL', state: 'completed', adhd: true, condNotes: 'Medication for ADHD' },
    { gEmail: 'bjorn.aberg@demo.test', gName: 'Björn Åberg', first: 'Nils', last: 'Åberg', dob: '2015-07-02', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '3+ Years', pos: 'Right Wing', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'ABERG 18', tshirtSize: 'Jr L', state: 'completed' },
    { gEmail: 'robert.engstrom@demo.test', gName: 'Robert Engström', first: 'Ludvig', last: 'Engström', dob: '2013-06-24', sex: 'Male', club: 'Chelmsford', ageGroup: 'U12', exp: '2+ Years', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'ENGSTROM 98', tshirtSize: 'Jr M', state: 'completed' },
    { gEmail: 'jade.hellstrom@demo.test', gName: 'Jade Hellström', first: 'Felix', last: 'Hellström', dob: '2017-05-28', sex: 'Male', club: 'Solihull', ageGroup: 'U10', exp: '3+ Years', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: '130', jerseyType: 'Player', personalization: 'FELIX 45', tshirtSize: 'Jr M', state: 'completed' },
    { gEmail: 'theresa.blomqvist@demo.test', gName: 'Theresa Blomqvist', first: 'Viktor', last: 'Blomqvist', dob: '2015-10-07', sex: 'Male', club: 'Milton Keynes', ageGroup: 'U10', exp: '6+ Months', pos: 'Left Wing', level: 'Club', product: 'HTH', jerseySize: 'M', jerseyType: 'Player', personalization: '', tshirtSize: 'Jr L', state: 'completed' },
    { gEmail: 'zoe.palmqvist@demo.test', gName: 'Zoe Palmqvist', first: 'Ebba', last: 'Palmqvist', dob: '2014-12-26', sex: 'Female', club: 'Chelmsford', ageGroup: 'U12', exp: '3+ Years', pos: 'Netminder', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Net Minder', personalization: 'PALMQVIST 1', tshirtSize: 'Jr L', state: 'completed' },
    { gEmail: 'alan.magnusson@demo.test', gName: 'Alan Magnusson', first: 'Linnea', last: 'Magnusson', dob: '2016-01-16', sex: 'Female', club: 'Chelmsford', ageGroup: 'U10', exp: '3+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: '130', jerseyType: 'Player', personalization: 'MAGNUSSON 6', tshirtSize: 'Jr M', state: 'completed' },
    { gEmail: 'claire.berglund@demo.test', gName: 'Claire Berglund', first: 'Isak', last: 'Berglund', dob: '2012-11-25', sex: 'Male', club: 'Streatham', ageGroup: 'U14', exp: '6+ Months', pos: 'Netminder', level: 'Club', product: 'HTH', jerseySize: 'M', jerseyType: 'Net Minder', personalization: 'BERGLUND 25', tshirtSize: 'M', state: 'completed' },
    { gEmail: 'jan.moberg@demo.test', gName: 'Jan Moberg', first: 'Anton', last: 'Moberg', dob: '2015-01-23', sex: 'Male', club: 'Chelmsford', ageGroup: 'U12', exp: '2+ Years', pos: 'Netminder', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Net Minder', personalization: '', tshirtSize: 'Jr M', state: 'completed' },
    { gEmail: 'meagan.vesterlund@demo.test', gName: 'Meagan Vesterlund', first: 'Albin', last: 'Vesterlund', dob: '2016-12-24', sex: 'Male', club: 'Whitley Bay', ageGroup: 'U10', exp: '2+ Years', pos: 'Left Wing', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'VESTERLUND 44', tshirtSize: 'Jr L', state: 'completed' },
    { gEmail: 'jennifer.engberg@demo.test', gName: 'Jennifer Engberg', first: 'Freja', last: 'Engberg', dob: '2011-03-30', sex: 'Female', club: 'Chelmsford', ageGroup: 'U16', exp: '3+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: 'S', jerseyType: 'Player', personalization: 'ENGBERG 51', tshirtSize: 'S', state: 'completed' },
    // ─── HTH — Incomplete states for testing ───
    { gEmail: 'anders.eklund@demo.test', gName: 'Anders Eklund', first: 'Signe', last: 'Eklund', dob: '2016-01-04', sex: 'Female', club: 'Romford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'EKLUND 73', tshirtSize: 'Jr M', state: 'invited' },
    { gEmail: 'jan.novak@demo.test', gName: 'Jan Novák', first: 'Klara', last: 'Novák', dob: '2016-09-04', sex: 'Female', club: 'Chelmsford', ageGroup: 'U10', exp: '3+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: '130', jerseyType: 'Player', personalization: 'KLARA', tshirtSize: 'S', state: 'invited' },
    { gEmail: 'daniel.ekstrom@demo.test', gName: 'Daniel Ekström', first: 'Noah', last: 'Ekström', dob: '2017-09-21', sex: 'Male', club: 'Guildford', ageGroup: 'U10', exp: '2+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: '140', jerseyType: 'Player', personalization: 'EKSTROM 97', tshirtSize: 'Jr L', state: 'in_progress' },
    { gEmail: 'ingrid.svensson@demo.test', gName: 'Ingrid Svensson', first: 'Arthur', last: 'Svensson', dob: '2018-05-26', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '2+ Years', pos: 'Defence', level: 'Club', product: 'HTH', jerseySize: '120', jerseyType: 'Player', personalization: 'ARTHUR 66', tshirtSize: 'Jr S', state: 'in_progress', surgery: true, medNotes: 'Tonsils removed April 2024' },
    // ─── Short Sticks (22 registrations) ───
    { gEmail: 'erik.johansson@demo.test', gName: 'Erik Johansson', first: 'Elliot', last: 'Johansson', dob: '2018-01-04', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '130', jerseyType: 'Player', personalization: 'ELLIOT 18', tshirtSize: 'Jr XL', state: 'completed' },
    { gEmail: 'maria.eriksson@demo.test', gName: 'Maria Eriksson', first: 'Sam', last: 'Eriksson', dob: '2018-01-29', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Defence', level: 'Club', product: 'SS', jerseySize: '130', jerseyType: 'Player', personalization: 'SAM 70', tshirtSize: 'Jr S', state: 'completed' },
    { gEmail: 'lena.nilsson@demo.test', gName: 'Lena Nilsson', first: 'Alva', last: 'Nilsson', dob: '2017-04-12', sex: 'Female', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Defence', level: 'Club', product: 'SS', jerseySize: '130', jerseyType: 'Player', personalization: 'NILSSON 19', tshirtSize: 'Jr S', state: 'completed' },
    { gEmail: 'lars.karlsson@demo.test', gName: 'Lars Karlsson', first: 'Sigge', last: 'Karlsson', dob: '2018-04-21', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Defence', level: 'Club', product: 'SS', jerseySize: '110', jerseyType: 'Player', personalization: 'KARLSSON 21', tshirtSize: 'Jr S', state: 'completed' },
    { gEmail: 'jonas.olsson@demo.test', gName: 'Jonas Olsson', first: 'Theo', last: 'Olsson', dob: '2018-03-26', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '2+ Years', pos: 'Netminder', level: 'Club', product: 'SS', jerseySize: '120', jerseyType: 'Net Minder', personalization: 'OLSSON 26', tshirtSize: 'Jr S', state: 'completed' },
    { gEmail: 'viktor.bergstrom@demo.test', gName: 'Viktor Bergström', first: 'Love', last: 'Bergström', dob: '2017-08-03', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '3+ Years', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '130', jerseyType: 'Player', personalization: 'BERGSTROM', tshirtSize: 'L', state: 'completed' },
    { gEmail: 'magnus.nystrom@demo.test', gName: 'Magnus Nyström', first: 'Olle', last: 'Nyström', dob: '2017-09-11', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '2+ Years', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '130', jerseyType: 'Player', personalization: 'OLLE 29', tshirtSize: 'Jr S', state: 'completed' },
    { gEmail: 'per.lundin@demo.test', gName: 'Per Lundin', first: 'Emil', last: 'Lundin', dob: '2017-09-29', sex: 'Male', club: 'Guildford', ageGroup: 'U10', exp: '2+ Years', pos: 'Defence', level: 'Club', product: 'SS', jerseySize: 'M', jerseyType: 'Player', personalization: 'LUNDIN 14', tshirtSize: 'S', state: 'completed' },
    { gEmail: 'jody.sandstrom@demo.test', gName: 'Jody Sandström', first: 'Viggo', last: 'Sandström', dob: '2016-12-22', sex: 'Male', club: 'Romford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '120', jerseyType: 'Player', personalization: 'SANDSTROM 12', tshirtSize: 'Jr S', state: 'completed', asthma: true, condNotes: 'Inhaler in bag if needed' },
    { gEmail: 'laura.hedstrom@demo.test', gName: 'Laura Hedström', first: 'Melvin', last: 'Hedström', dob: '2017-03-12', sex: 'Male', club: 'Romford', ageGroup: 'U10', exp: '2+ Years', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '110', jerseyType: 'Player', personalization: 'HEDSTROM', tshirtSize: '100', state: 'completed' },
    { gEmail: 'daniel.holmberg@demo.test', gName: 'Daniel Holmberg', first: 'Alfred', last: 'Holmberg', dob: '2016-10-31', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '130', jerseyType: 'Player', personalization: '', tshirtSize: 'Jr M', state: 'completed' },
    { gEmail: 'daniel.holmberg@demo.test', gName: 'Daniel Holmberg', first: 'Edvin', last: 'Holmberg', dob: '2018-10-05', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '130', jerseyType: 'Player', personalization: '', tshirtSize: 'Jr M', state: 'completed' },
    { gEmail: 'andrea.nordin@demo.test', gName: 'Andrea Nordin', first: 'Loke', last: 'Nordin', dob: '2018-09-29', sex: 'Male', club: 'Romford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '100', jerseyType: 'Player', personalization: 'NORDIN 42', tshirtSize: 'Jr S', state: 'completed' },
    { gEmail: 'jaspar.lindahl@demo.test', gName: 'Jaspar Lindahl', first: 'Sixten', last: 'Lindahl', dob: '2016-11-16', sex: 'Male', club: 'Invicta', ageGroup: 'U10', exp: '6+ Months', pos: 'Defence', level: 'Club', product: 'SS', jerseySize: '140', jerseyType: 'Player', personalization: 'LINDAHL 47', tshirtSize: 'Jr L', state: 'completed' },
    { gEmail: 'alex.nordstrom@demo.test', gName: 'Alex Nordström', first: 'Ville', last: 'Nordström', dob: '2016-08-14', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Defence', level: 'Club', product: 'SS', jerseySize: '130', jerseyType: 'Player', personalization: 'NORDSTROM 71', tshirtSize: '100', state: 'completed', asthma: true, condNotes: 'Mild asthma — Soprobec and salbutamol' },
    { gEmail: 'graham.westerberg@demo.test', gName: 'Graham Westerberg', first: 'Ture', last: 'Westerberg', dob: '2019-01-19', sex: 'Male', club: 'Romford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '110', jerseyType: 'Player', personalization: 'TURE 97', tshirtSize: '100', state: 'completed' },
    // ─── SS — Incomplete states for testing ───
    { gEmail: 'erik.johansson@demo.test', gName: 'Erik Johansson', first: 'Vilgot', last: 'Johansson', dob: '2017-07-15', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '120', jerseyType: 'Player', personalization: 'VILGOT 8', tshirtSize: 'Jr S', state: 'invited' },
    { gEmail: 'per.lundin@demo.test', gName: 'Per Lundin', first: 'Ida', last: 'Lundin', dob: '2018-02-10', sex: 'Female', club: 'Guildford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '110', jerseyType: 'Player', personalization: 'IDA 5', tshirtSize: 'Jr S', state: 'invited' },
    { gEmail: 'lena.nilsson@demo.test', gName: 'Lena Nilsson', first: 'Hampus', last: 'Nilsson', dob: '2017-08-22', sex: 'Male', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '120', jerseyType: 'Player', personalization: 'HAMPUS 30', tshirtSize: 'Jr S', state: 'uninvited' },
    { gEmail: 'claire.berglund@demo.test', gName: 'Claire Berglund', first: 'Tuva', last: 'Berglund', dob: '2018-06-14', sex: 'Female', club: 'Streatham', ageGroup: 'U10', exp: '6+ Months', pos: 'Defence', level: 'Club', product: 'SS', jerseySize: '110', jerseyType: 'Player', personalization: 'TUVA 9', tshirtSize: 'Jr S', state: 'uninvited' },
    { gEmail: 'bjorn.aberg@demo.test', gName: 'Björn Åberg', first: 'Tilde', last: 'Åberg', dob: '2017-11-03', sex: 'Female', club: 'Chelmsford', ageGroup: 'U10', exp: '6+ Months', pos: 'Forward', level: 'Club', product: 'SS', jerseySize: '120', jerseyType: 'Player', personalization: 'TILDE 2', tshirtSize: 'Jr S', state: 'uninvited' },
];

// ─── Form Schema (simplified version of the hockey camp form) ────────
const FORM_SCHEMA = JSON.stringify([
    { id: 's1_h', type: 'heading', label: 'Hockey Sweden Camp Registration', required: false, headingLevel: 'h1' },
    { id: 'first_name', type: 'text', label: 'Participants Forename', required: true },
    { id: 'last_name', type: 'text', label: 'Participants Surname', required: true },
    { id: 'dob', type: 'text', label: 'Date Of Birth', required: true },
    { id: 'sex', type: 'radio', label: 'Sex', required: true, options: ['Male', 'Female'] },
    { id: 'club', type: 'text', label: 'Current Club', required: true },
    { id: 'age_group', type: 'radio', label: 'Age Group', required: true, options: ['U10', 'U12', 'U14', 'U16'] },
    { id: 'experience', type: 'radio', label: 'Playing Experience', required: true, options: ['6+ Months', '2+ Years', '3+ Years'] },
    { id: 'position', type: 'radio', label: 'Position', required: true, options: ['Forward', 'Defence', 'Left Wing', 'Right Wing', 'Netminder'] },
    { id: 'camp_applied', type: 'radio', label: 'Camp applied for', required: true, options: ['Short Sticks', 'Hat-Trick Heroes'] },
    { id: 'jersey_size', type: 'text', label: 'Jersey Size', required: true },
    { id: 'jersey_type', type: 'radio', label: 'Jersey Type', required: true, options: ['Player', 'Net Minder'] },
    { id: 'personalization', type: 'text', label: 'Personalization (Name & Number)', required: false },
    { id: 'tshirt_size', type: 'text', label: 'T-Shirt Size', required: true },
    { id: 'med_broken_bones', type: 'radio', label: 'Broken bones in last 2 years?', required: true, options: ['Yes', 'No'] },
    { id: 'med_concussion', type: 'radio', label: 'Suffered a concussion?', required: true, options: ['Yes', 'No'] },
    { id: 'med_surgery', type: 'radio', label: 'Surgery in past 2 years?', required: true, options: ['Yes', 'No'] },
    { id: 'med_asthma', type: 'radio', label: 'Suffer from asthma?', required: true, options: ['Yes', 'No'] },
    { id: 'med_diabetes', type: 'radio', label: 'Suffer from diabetes?', required: true, options: ['Yes', 'No'] },
    { id: 'med_allergies', type: 'radio', label: 'Suffer from allergies?', required: true, options: ['Yes', 'No'] },
    { id: 'medical_details', type: 'textarea', label: 'Medical Details', required: false },
    { id: 'emergency1_name', type: 'text', label: 'Emergency Contact 1 Name', required: true },
    { id: 'emergency1_phone', type: 'text', label: 'Emergency Contact 1 Phone', required: true },
    { id: 'emergency1_relationship', type: 'text', label: 'Relationship', required: true },
    { id: 'emergency2_name', type: 'text', label: 'Emergency Contact 2 Name', required: true },
    { id: 'emergency2_phone', type: 'text', label: 'Emergency Contact 2 Phone', required: true },
    { id: 'emergency2_relationship', type: 'text', label: 'Relationship', required: true },
    { id: 'consent_medical', type: 'checkbox', label: 'I consent to medical disclosure.', required: true },
    { id: 'consent_rules', type: 'checkbox', label: 'I agree to rink rules.', required: true },
    { id: 'consent_tc', type: 'checkbox', label: 'I have read the terms and conditions.', required: true },
    { id: 'consent_photo', type: 'checkbox', label: 'I agree to photography/video.', required: true },
    { id: 'digital_signature', type: 'text', label: 'Digital Signature', required: true },
]);

function buildFormResponse(e: DemoEntry, guardianName: string): string {
    const phoneBase = '+44 7700 900';
    const idx = ENTRIES.indexOf(e);
    const p1 = `${phoneBase}${String(idx * 2).padStart(3, '0')}`;
    const p2 = `${phoneBase}${String(idx * 2 + 1).padStart(3, '0')}`;
    return JSON.stringify({
        first_name: e.first,
        last_name: e.last,
        dob: e.dob,
        sex: e.sex,
        club: e.club,
        age_group: e.ageGroup,
        experience: e.exp,
        position: e.pos,
        level: e.level,
        camp_applied: e.product === 'HTH' ? 'Hat-Trick Heroes' : 'Short Sticks',
        jersey_size: e.jerseySize,
        jersey_type: e.jerseyType,
        personalization: e.personalization,
        tshirt_size: e.tshirtSize,
        med_broken_bones: e.brokenBones ? 'Yes' : 'No',
        med_concussion: e.concussion ? 'Yes' : 'No',
        med_surgery: e.surgery ? 'Yes' : 'No',
        med_asthma: e.asthma ? 'Yes' : 'No',
        med_diabetes: e.diabetes ? 'Yes' : 'No',
        med_allergies: 'No',
        medical_details: e.medNotes || e.condNotes || '',
        emergency1_name: guardianName,
        emergency1_phone: p1,
        emergency1_relationship: 'Parent',
        emergency2_name: `Partner of ${guardianName.split(' ')[0]}`,
        emergency2_phone: p2,
        emergency2_relationship: 'Parent',
        consent_medical: true,
        consent_rules: true,
        consent_tc: true,
        consent_photo: true,
        digital_signature: guardianName,
    });
}

// ─── Main Handler ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const db = await getDb();

        // Auth: require admin token
        const { results: tokenRows } = await db.prepare(
            "SELECT value FROM SystemSettings WHERE key = 'admin_token'"
        ).all<{ value: string }>();
        const storedToken = tokenRows?.[0]?.value;
        const providedToken = request.headers.get('x-admin-token') || new URL(request.url).searchParams.get('token');

        if (!storedToken || providedToken !== storedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Safety: check if demo camp already exists
        const exists = await db.prepare("SELECT id FROM Camps WHERE name = 'Swedish Hockey Camp 2025'").first();
        if (exists) {
            return NextResponse.json({ error: 'Demo data already exists. Delete the camp first to re-seed.' }, { status: 409 });
        }

        // ═══════════════════════════════════════════════════════════════
        //  PHASE 1: Core structure — Camp, Products, Links
        // ═══════════════════════════════════════════════════════════════
        await db.prepare("INSERT INTO Camps (name, year, status) VALUES ('Swedish Hockey Camp 2025', 2025, 'active')").run();
        const camp = await db.prepare("SELECT id FROM Camps WHERE name = 'Swedish Hockey Camp 2025'").first<{ id: number }>();
        const campId = camp!.id;

        // FormTemplate
        await db.prepare("INSERT OR IGNORE INTO FormTemplates (name, description, schema_json) VALUES (?, ?, ?)")
            .bind('Hockey Camp Registration', 'Standard 3-day camp registration form', FORM_SCHEMA).run();
        const tmpl = await db.prepare("SELECT id FROM FormTemplates ORDER BY id DESC LIMIT 1").first<{ id: number }>();
        const templateId = tmpl!.id;

        // Products
        await db.batch([
            db.prepare("INSERT INTO Products (name, sku, base_price, description, status, form_template_id) VALUES (?, ?, ?, ?, 'active', ?)")
                .bind('Hat-Trick Heroes', 'HTH-2025', 295.00, 'For players born 2010-2016 with 18+ months experience', templateId),
            db.prepare("INSERT INTO Products (name, sku, base_price, description, status, form_template_id) VALUES (?, ?, ?, ?, 'active', ?)")
                .bind('Short Sticks', 'SS-2025', 195.00, 'For players born 2013-2018 with 6+ months experience', templateId),
        ]);
        const hthProduct = await db.prepare("SELECT id FROM Products WHERE sku = 'HTH-2025'").first<{ id: number }>();
        const ssProduct = await db.prepare("SELECT id FROM Products WHERE sku = 'SS-2025'").first<{ id: number }>();
        const productMap = { HTH: hthProduct!.id, SS: ssProduct!.id };

        // CampProducts & Forms
        await db.batch([
            db.prepare("INSERT INTO CampProducts (camp_id, product_id, price, status) VALUES (?, ?, 295.00, 'active')").bind(campId, productMap.HTH),
            db.prepare("INSERT INTO CampProducts (camp_id, product_id, price, status) VALUES (?, ?, 195.00, 'active')").bind(campId, productMap.SS),
            db.prepare("INSERT INTO Forms (product_id, name, schema_json, is_active) VALUES (?, 'HTH Registration 2025', ?, 1)").bind(productMap.HTH, FORM_SCHEMA),
            db.prepare("INSERT INTO Forms (product_id, name, schema_json, is_active) VALUES (?, 'SS Registration 2025', ?, 1)").bind(productMap.SS, FORM_SCHEMA),
        ]);
        const hthForm = await db.prepare("SELECT id FROM Forms WHERE product_id = ?").bind(productMap.HTH).first<{ id: number }>();
        const ssForm = await db.prepare("SELECT id FROM Forms WHERE product_id = ?").bind(productMap.SS).first<{ id: number }>();
        const formMap = { HTH: hthForm!.id, SS: ssForm!.id };

        // CampSettings
        await db.prepare("INSERT INTO CampSettings (camp_id, reminders_enabled, reminder_cadence_days, max_reminders) VALUES (?, 1, 7, 3)")
            .bind(campId).run();

        // ═══════════════════════════════════════════════════════════════
        //  PHASE 2: Schedule — Days, Streams, Sessions
        // ═══════════════════════════════════════════════════════════════
        await db.batch([
            db.prepare("INSERT INTO CampDays (camp_id, date, label, status) VALUES (?, '2025-08-18', 'Day 1 — Monday', 'active')").bind(campId),
            db.prepare("INSERT INTO CampDays (camp_id, date, label, status) VALUES (?, '2025-08-19', 'Day 2 — Tuesday', 'active')").bind(campId),
            db.prepare("INSERT INTO CampDays (camp_id, date, label, status) VALUES (?, '2025-08-20', 'Day 3 — Wednesday', 'active')").bind(campId),
        ]);
        const { results: dayRows } = await db.prepare("SELECT id FROM CampDays WHERE camp_id = ? ORDER BY date").bind(campId).all<{ id: number }>();
        const dayIds = dayRows!.map(r => r.id);

        await db.batch([
            db.prepare("INSERT INTO Streams (camp_id, name, status) VALUES (?, 'Hat-Trick Heroes', 'active')").bind(campId),
            db.prepare("INSERT INTO Streams (camp_id, name, status) VALUES (?, 'Short Sticks', 'active')").bind(campId),
        ]);
        const { results: streamRows } = await db.prepare("SELECT id, name FROM Streams WHERE camp_id = ? ORDER BY id").bind(campId).all<{ id: number; name: string }>();
        const hthStreamId = streamRows!.find(s => s.name === 'Hat-Trick Heroes')!.id;
        const ssStreamId = streamRows!.find(s => s.name === 'Short Sticks')!.id;

        // Sessions for each day (same schedule repeated)
        const sessionDefs = [
            { name: 'Arrival & Kit-Up', start: '08:30', end: '09:00', loc: 'Lobby', streams: [hthStreamId, ssStreamId] },
            { name: 'On-Ice Skills', start: '09:00', end: '10:30', loc: 'Rink 1', streams: [hthStreamId, ssStreamId] },
            { name: 'Break', start: '10:30', end: '10:45', loc: 'Café', streams: [hthStreamId, ssStreamId] },
            { name: 'Dryland Training', start: '10:45', end: '11:30', loc: 'Gym', streams: [hthStreamId, ssStreamId] },
            { name: 'Lunch', start: '12:00', end: '13:00', loc: 'Café', streams: [hthStreamId, ssStreamId] },
            { name: 'Scrimmage', start: '13:15', end: '14:45', loc: 'Rink 1', streams: [hthStreamId] },
            { name: 'Fun Games', start: '13:15', end: '14:15', loc: 'Rink 2', streams: [ssStreamId] },
            { name: 'Cool Down & Depart', start: '14:45', end: '15:00', loc: 'Lobby', streams: [hthStreamId, ssStreamId] },
        ];

        for (const dayId of dayIds) {
            const sessionStmts = sessionDefs.map(s =>
                db.prepare("INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES (?, ?, ?, ?, ?)")
                    .bind(dayId, s.name, s.start, s.end, s.loc)
            );
            await db.batch(sessionStmts);

            // Get inserted session IDs for this day
            const { results: sessRows } = await db.prepare("SELECT id, name FROM Sessions WHERE camp_day_id = ? ORDER BY start_time").bind(dayId).all<{ id: number; name: string }>();

            const streamLinkStmts: D1PreparedStatement[] = [];
            for (const sess of sessRows!) {
                const def = sessionDefs.find(d => d.name === sess.name);
                if (def) {
                    for (const streamId of def.streams) {
                        streamLinkStmts.push(
                            db.prepare("INSERT INTO SessionStreams (session_id, stream_id) VALUES (?, ?)").bind(sess.id, streamId)
                        );
                    }
                }
            }
            if (streamLinkStmts.length > 0) await db.batch(streamLinkStmts);
        }

        // ═══════════════════════════════════════════════════════════════
        //  PHASE 3: Registrations — Guardians, Purchases, Players, etc.
        // ═══════════════════════════════════════════════════════════════
        const guardianIdMap = new Map<string, number>();

        // Deduplicate guardians
        const uniqueGuardians = [...new Map(ENTRIES.map(e => [e.gEmail, e.gName])).entries()];
        const guardianStmts = uniqueGuardians.map(([email, name]) =>
            db.prepare("INSERT INTO Guardians (email, full_name) VALUES (?, ?)").bind(email, name)
        );
        await db.batch(guardianStmts);

        // Fetch their IDs
        for (const [email] of uniqueGuardians) {
            const g = await db.prepare("SELECT id FROM Guardians WHERE email = ?").bind(email).first<{ id: number }>();
            if (g) guardianIdMap.set(email, g.id);
        }

        // Create Purchases + Players + Registrations + KitOrders
        const purchaseTimestamps = [
            '2025-03-23', '2025-03-24', '2025-03-25', '2025-03-27', '2025-03-29',
            '2025-04-02', '2025-04-03', '2025-04-04', '2025-04-06', '2025-04-08',
            '2025-04-09', '2025-04-10', '2025-04-13', '2025-05-04', '2025-05-09',
        ];

        let registrationCount = 0;
        let kitOrderCount = 0;

        for (let i = 0; i < ENTRIES.length; i++) {
            const e = ENTRIES[i];
            const guardianId = guardianIdMap.get(e.gEmail)!;
            const productId = productMap[e.product];
            const price = e.product === 'HTH' ? 295.00 : 195.00;
            const ts = purchaseTimestamps[i % purchaseTimestamps.length] + 'T10:00:00Z';
            const token = `demo-token-${String(i + 1).padStart(3, '0')}`;

            // Purchase
            await db.prepare(`
                INSERT INTO Purchases (guardian_id, camp_id, product_id, quantity, registration_state, purchase_timestamp, price_at_purchase, currency, registration_token)
                VALUES (?, ?, ?, 1, ?, ?, ?, 'GBP', ?)
            `).bind(guardianId, campId, productId, e.state, ts, price, token).run();

            const purchase = await db.prepare("SELECT id FROM Purchases WHERE registration_token = ?").bind(token).first<{ id: number }>();
            const purchaseId = purchase!.id;

            // Player
            await db.prepare("INSERT INTO Players (guardian_id, first_name, last_name, date_of_birth, sex) VALUES (?, ?, ?, ?, ?)")
                .bind(guardianId, e.first, e.last, e.dob, e.sex).run();
            const player = await db.prepare("SELECT id FROM Players WHERE guardian_id = ? AND first_name = ? AND last_name = ?")
                .bind(guardianId, e.first, e.last).first<{ id: number }>();
            const playerId = player!.id;

            // Registration + KitOrders (only for completed)
            if (e.state === 'completed') {
                const formId = formMap[e.product];
                const formResponse = buildFormResponse(e, e.gName);

                await db.prepare(`
                    INSERT INTO Registrations (purchase_id, player_id, form_id, registration_timestamp, form_response_json)
                    VALUES (?, ?, ?, ?, ?)
                `).bind(purchaseId, playerId, formId, ts, formResponse).run();

                const reg = await db.prepare("SELECT id FROM Registrations WHERE purchase_id = ?").bind(purchaseId).first<{ id: number }>();
                const regId = reg!.id;

                // Kit Orders: jersey + t-shirt
                await db.batch([
                    db.prepare("INSERT INTO KitOrders (registration_id, item_type, size, personalization_name, personalization_number) VALUES (?, 'jersey', ?, ?, ?)")
                        .bind(regId, e.jerseySize, e.personalization.split(' ')[0] || null, e.personalization.split(' ')[1] || null),
                    db.prepare("INSERT INTO KitOrders (registration_id, item_type, size) VALUES (?, 't-shirt', ?)")
                        .bind(regId, e.tshirtSize),
                ]);
                kitOrderCount += 2;

                // Store formData on purchase too
                await db.prepare("UPDATE Purchases SET registration_data = ? WHERE id = ?")
                    .bind(formResponse, purchaseId).run();

                registrationCount++;
            }
        }

        // ═══════════════════════════════════════════════════════════════
        //  Summary
        // ═══════════════════════════════════════════════════════════════
        return NextResponse.json({
            success: true,
            summary: {
                camp: { id: campId, name: 'Swedish Hockey Camp 2025' },
                products: { hth: productMap.HTH, ss: productMap.SS },
                guardians: uniqueGuardians.length,
                players: ENTRIES.length,
                purchases: ENTRIES.length,
                completedRegistrations: registrationCount,
                kitOrders: kitOrderCount,
                campDays: dayIds.length,
                streams: 2,
                sessionsPerDay: sessionDefs.length,
            },
        });

    } catch (error: any) {
        console.error('[seed-demo] Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
