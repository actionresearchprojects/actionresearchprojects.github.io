// ARC site-wide translations — Phase 1 (UI / nav / footer / shared chrome).
// Each key is namespaced by area. To add a new translatable string:
//   1. Add key to BOTH en and sw blocks.
//   2. Add data-i18n="<key>" attribute to the element in batch-edit.js (or directly).
// For Kiswahili review: technical/architectural terminology should be checked by a
// fluent speaker before being treated as authoritative.
window.ARC_TRANSLATIONS = {
  en: {
    // Nav buttons (sidebar on standard-layout pages)
    'nav.cbg': 'Cool Buildings Guide',
    'nav.map': 'People & Projects Map',
    'nav.support': "Support ARC’s mission to keep buildings cool in a changing climate",
    'nav.reflections': 'Reflections',
    'nav.people': 'ARC People',
    'nav.science': 'Science',
    'nav.projects': 'ARC Projects',

    // Three-dots overlay menu
    'menu.about': 'About',
    'menu.contact': 'Contact Us',
    'menu.standard': 'ARC Standard',
    'menu.blog': 'Blog',

    // Footer
    'footer.copyright': '© 2026 ARC, a programme of Simmonds Mills. All rights reserved.',
    'footer.privacy': 'Privacy',

    // Language menu
    'lang.title': 'Language',
    'lang.en': 'English',
    'lang.sw': 'Kiswahili',

    // Orientation overlay
    'orientation.landscape': 'Please rotate your device to landscape mode',
    'orientation.portrait': 'Please rotate your device to portrait mode',

    // Common page titles (browser tab)
    'title.home': 'ARC (Architecture for Resilient Communities)',
    'title.cbg': 'Cool Buildings Guide — ARC',
    'title.map': 'People & Projects Map — ARC',
    'title.people': 'ARC People',
    'title.projects': 'ARC Projects',
    'title.reflections': 'Reflections — ARC',
    'title.science': 'Science — ARC',
    'title.support': 'Support ARC',
    'title.about': 'About — ARC',
    'title.contact': 'Contact Us — ARC',
    'title.privacy': 'Privacy — ARC',
    'title.standard': 'ARC Standard',
    'title.blog': 'Blog — ARC',

    // Common shared headings (used on multiple pages)
    'common.readMore': 'Read more',
    'common.learnMore': 'Learn more',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.loading': 'Loading…',
    'common.contact': 'Contact',
    'common.about': 'About',

    // ── Phase 2: page body content ────────────────────────────

    // about.html
    'about.heading': 'About Us',
    'about.tagline': 'Developing climate-adaptive architecture in warming climates through collaboration, practice and monitoring.',
    'about.mission.heading': 'Our Mission',
    'about.mission.body': "The ARC 'Cool Buildings' programme addresses the pressing challenge of achieving thermal comfort in hot and humid climates. It focuses on developing, testing, and disseminating innovative passive cooling solutions that are affordable, sustainable, and adaptable to local needs. ARC is a team of volunteers led by Andrew Simmonds of Simmonds Mills, a UK-based architectural R&D firm, in partnership with the Al-Mizan Children's Ecovillage in Tanzania, which serves as the first of several ARC-initiated field-testing R&D sites in Africa and Asia. The Ecovillage management and staff provide ARC with facilities and collaborative capacity, acting as a hub for exemplar-building demonstration, community engagement, creative problem solving, knowledge and solutions dissemination.",
    'about.serve.heading': 'Who We Serve',
    'about.serve.body': 'The project specifically targets two key markets: lower-income self-builders, who require affordable and accessible solutions to improve housing quality, and higher-income managed self-builders, who demand passive cooling innovations that can be integrated with modern building standards. By addressing the distinct needs of these market segments, the project ensures scalability and adoption across a wide socioeconomic spectrum.',
    'about.approach.heading': 'Our Approach',
    'about.approach.body': 'By integrating robust R&D with community engagement, ARC is supporting innovative and scalable pathways to improve thermal comfort in buildings in hot and humid climates, addressing both immediate needs and long-term sustainability goals for people living in environmentally and socio-economically challenging regions. ARC solutions aim to create cool, comfortable indoor environments without the immediate need for mechanical cooling and dehumidification equipment.',
    'about.futureproof.heading': 'Future-Proofing',
    'about.futureproof.body': 'As global temperatures rise and climate-vulnerable countries face increasing extreme heat and intense rainfall events, there will inevitably come a point when passive cooling alone may no longer suffice. Recognising this, our approach is to future-proof designs to allow for easier retrofit of energy-efficient mechanical cooling and dehumidification systems. This ensures that buildings designed today will not only meet the immediate needs of their occupants but also remain adaptable to future climate conditions. The solutions developed will integrate with modern mechanical systems to minimise energy consumption and operational costs, avoiding the common problem of retrofitted buildings consuming unsustainable amounts of energy.',

    // contact.html
    'contact.heading': 'Contact Us',
    'contact.touch.heading': 'Get in Touch',
    'contact.touch.body': "If you're interested in our research, want to explore collaboration opportunities, or have questions about passive cooling solutions for hot and humid climates, please reach out using the form.",
    'contact.who.heading': 'Who We Are',
    'contact.who.body': "ARC is led by Andrew Simmonds of <a href=\"https://simmondsmills.com\" target=\"_blank\" rel=\"noopener\">Simmonds Mills</a>, a UK-based architectural R&D firm, in partnership with the Al-Mizan Children's Ecovillage in Tanzania.",
    'contact.follow.heading': 'Follow Us',
    'contact.follow.body': 'Stay up to date with our latest research and projects on <a href="https://www.linkedin.com/company/arc-cool-buildings" target="_blank" rel="noopener">LinkedIn</a>.',
    'contact.send.heading': 'Send a Message',

    // Form fields (shared between contact + support)
    'form.name': 'Name',
    'form.email': 'Email',
    'form.org': 'Company / Organisation (optional)',
    'form.org_if': 'Company/Organisation (if applicable)',
    'form.message': 'Message',
    'form.send': 'Send Message',
    'form.submit': 'Submit',
    'form.contribution': 'Estimated Contribution',
    'form.placeholder.name': 'Your full name',
    'form.placeholder.email': 'you@example.com',
    'form.placeholder.org': 'Your organisation',
    'form.placeholder.message': 'Your message',

    // privacy.html
    'privacy.heading': 'Privacy Policy',
    'privacy.lastUpdated': 'Last updated: March 2026',
    'privacy.who.heading': 'Who we are',
    'privacy.who.body': 'This website is operated by the ARC Cool Buildings programme, an initiative of Simmonds Mills Architects. Our website address is <a href="https://actionresearchprojects.net">actionresearchprojects.net</a>.',
    'privacy.data.heading': 'What data we collect',
    'privacy.data.body': 'This is a static website. We do not collect, store, or process any personal data through this site. There are no user accounts, no tracking cookies, and no analytics scripts that gather personal information from visitors.',
    'privacy.cookies.heading': 'Cookies',
    'privacy.cookies.body': 'This website does not set any cookies.',
    'privacy.thirdparty.heading': 'Third-party services',
    'privacy.thirdparty.body': 'This site uses the following third-party services, each of which has its own privacy policy:',
    'privacy.thirdparty.github.li': '<strong>GitHub Pages</strong> hosts this website. GitHub may collect technical information such as IP addresses in server logs. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">GitHub\'s privacy statement</a>.',
    'privacy.thirdparty.google.li': '<strong>Google Fonts</strong> are loaded from Google\'s servers. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google\'s privacy policy</a>.',
    'privacy.thirdparty.mapbox.li': '<strong>Mapbox</strong> is used on the project map page. See <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener">Mapbox\'s privacy policy</a>.',
    'privacy.external.heading': 'External links',
    'privacy.external.body': 'This site contains links to external websites, including LinkedIn and GitHub. We are not responsible for the privacy practices of those sites.',
    'privacy.contact.heading': 'Contact',
    'privacy.contact.body': 'If you have questions about this privacy policy, you can reach us through our <a href="/contact">contact page</a>.',
    'privacy.back': '← Back to home',

    // support.html (form + headings; long-form copy in next batch)
    'support.heading': 'Support Us',
    'support.tagline': "<strong class=\"framer-text\">Help us develop cool, healthy building practices where they’re needed most urgently.</strong>",
    'support.smaller.heading': 'For Smaller Donations',
    'support.larger.heading': 'For Larger Donations',
    'support.sponsors.heading': 'Our Sponsors',
    'support.thanks': 'Thank you!',
    'support.share': 'Another way you can support us is by sharing ARC on social media.',
    'support.bank.intro1': 'We are accepting bank transfers for smaller donations in order to avoid processing fees associated',
    'support.bank.intro2': 'with major platforms. To support us, please send your donation to  the following account:',
    'support.bank.details': 'Account Name: ARC ARCHITECTURE FOR RESILIENT COMM<br class="framer-text">Sort Code: 08-92-99<br class="framer-text">Account Number: 6338731700',
    'support.larger.intro': "Our supporters come from all walks of life, and share ARC's enthusiasm to make high performance, climate-resilient building accessible to all. Please fill in the form below if you are considering supporting our mission.",

    // arc-standard.html
    'standard.underConstruction': 'Under Construction',
    'standard.backHome': 'Back to home',

    // 404.html
    'notFound.heading': 'Page not found',
    'notFound.body': "The page you're looking for doesn't exist or has been moved.",

    // blog/index.html
    'blog.title': 'ARC Blog',
    'blog.backToSite': 'Back to site',
    'blog.updates': 'Updates',
    'blog.tagline': 'Latest from ARC - Architecture for Resilient Communities',
    'blog.loading': 'Loading posts...',
    'blog.allPosts': '← All posts',

    // ── Embedded sub-projects ──────────────────────────────────
    // projects-grid (iframed into projects/index.html)
    'pg.project1': 'Project 1',

    // CBG-grid (iframed into cool-buildings-guide/index.html) — chapter cards
    'cbg.avoidingHeat': 'Avoiding Heat',
    'cbg.keepingHeatOut': 'Keeping Heat Out',
    'cbg.airMovement': 'Air Movement',
    'cbg.coolingTheAir': 'Cooling the Air',
    'cbg.dryingTheAir': 'Drying the Air',
    'cbg.thermalMass': 'Thermal Mass',
    'cbg.practicalConstraints': 'Practical Constraints',
    'cbg.environmentalPerformance': 'Environmental Performance',

    // science-grid (iframed into science/index.html) — module cards
    'sg.module1': 'Module 1: The ARC standard for cool buildings',
    'sg.module2': 'Module 2: Physical factors that affect comfort',
    'sg.module3': 'Module 3: Keeping cool in heatwaves',
    'sg.module4': "Module 4: The 'three zone' concept for buildings",
    'sg.module5': 'Module 5: Resources',
    'sg.module6': 'Module 6: Insect protection',
    'sg.module7': 'Module 7: Citizen Science Experiments',

    // arc-people (iframed into people.html) — aria-labels for accessibility
    // (the bios themselves are rasterized in biogs/*.webp images)
    'ap.prevImage': 'Previous image',
    'ap.nextImage': 'Next image',
    'ap.openLink': 'Open external link',
    'ap.expandedView': 'Expanded view',
    'ap.previous': 'Previous',
    'ap.next': 'Next',

    // reflections-grid (iframed into reflections/index.html) — case study cards
    'rg.expertAdvisor': 'Expert Advisor: Huda Elsherif',
    'rg.shelyBegum': 'Shely Begum: Desh Houses',
    'rg.house5php': "Tanzanian children's eco village aims to inspire low carbon example",
    'rg.simmondsmills': 'SimmondsMills: Tanzania Eco Village',
    'rg.scroll': '↓ Scroll',

    // project-map (iframed into map.html) — UI controls
    'pm.showClimate': 'Show Climate',
    'pm.climateOpacity': 'Climate opacity',
    'pm.showLegend': 'Show Legend',
  },

  sw: {
    // Nav buttons (kept short to fit Framer's fixed-width buttons)
    'nav.cbg': 'Mwongozo wa Majengo Baridi',
    'nav.map': 'Ramani ya Watu na Miradi',
    'nav.support': 'Saidia ARC kupoza majengo katika tabianchi inayobadilika',
    'nav.reflections': 'Tafakari',
    'nav.people': 'Watu wa ARC',
    'nav.science': 'Sayansi',
    'nav.projects': 'Miradi ya ARC',

    // Three-dots overlay menu
    'menu.about': 'Kuhusu',
    'menu.contact': 'Wasiliana Nasi',
    'menu.standard': 'Kiwango cha ARC',
    'menu.blog': 'Blogu',

    // Footer
    'footer.copyright': '© 2026 ARC, programu ya Simmonds Mills. Haki zote zimehifadhiwa.',
    'footer.privacy': 'Faragha',

    // Language menu
    'lang.title': 'Lugha',
    'lang.en': 'Kiingereza',
    'lang.sw': 'Kiswahili',

    // Orientation overlay
    'orientation.landscape': 'Tafadhali geuza kifaa chako kwa mlalo',
    'orientation.portrait': 'Tafadhali geuza kifaa chako kwa wima',

    // Page titles
    'title.home': 'ARC (Usanifu wa Majengo kwa Jamii Imara)',
    'title.cbg': 'Mwongozo wa Majengo Baridi — ARC',
    'title.map': 'Ramani ya Watu na Miradi — ARC',
    'title.people': 'Watu wa ARC',
    'title.projects': 'Miradi ya ARC',
    'title.reflections': 'Tafakari — ARC',
    'title.science': 'Sayansi — ARC',
    'title.support': 'Saidia ARC',
    'title.about': 'Kuhusu — ARC',
    'title.contact': 'Wasiliana Nasi — ARC',
    'title.privacy': 'Faragha — ARC',
    'title.standard': 'Kiwango cha ARC',
    'title.blog': 'Blogu — ARC',

    // Common shared headings
    'common.readMore': 'Soma zaidi',
    'common.learnMore': 'Jifunze zaidi',
    'common.back': 'Rudi',
    'common.next': 'Inayofuata',
    'common.previous': 'Iliyopita',
    'common.loading': 'Inapakia…',
    'common.contact': 'Wasiliana',
    'common.about': 'Kuhusu',

    // ── Phase 2: page body content ────────────────────────────

    // about.html
    'about.heading': 'Kuhusu Sisi',
    'about.tagline': 'Kuendeleza usanifu wa majengo unaokabiliana na mabadiliko ya tabianchi katika hali ya hewa inayozidi kupata joto, kupitia ushirikiano, mazoezi na ufuatiliaji.',
    'about.mission.heading': 'Dhamira Yetu',
    'about.mission.body': "Programu ya ARC ya 'Majengo Yanayopoa' inashughulikia changamoto kubwa ya kupata faraja ya hali ya joto katika maeneo yenye joto na unyevu. Inazingatia kuendeleza, kupima, na kusambaza suluhu mpya za upoaji bila umeme ambazo ni nafuu, endelevu, na zinazoweza kuendana na mahitaji ya wenyeji. ARC ni timu ya wajitolea inayoongozwa na Andrew Simmonds wa Simmonds Mills, kampuni ya R&D ya usanifu wa majengo iliyoko Uingereza, kwa ushirikiano na Kijiji cha Watoto cha Kiikolojia cha Al-Mizan kilichoko Tanzania, ambacho ni cha kwanza kati ya maeneo kadhaa ya R&D ya majaribio ya nyanjani yaliyoanzishwa na ARC barani Afrika na Asia. Uongozi na wafanyakazi wa Kijiji cha Kiikolojia wanaipa ARC vifaa na uwezo wa kushirikiana, wakitumika kama kituo cha kuonyesha majengo bora, kushirikisha jamii, kutatua matatizo kwa ubunifu, na kueneza maarifa na suluhu.",
    'about.serve.heading': 'Tunaowahudumia',
    'about.serve.body': 'Mradi unalenga mahususi makundi mawili makuu: wajenzi-binafsi wa kipato cha chini, wanaohitaji suluhu nafuu na zinazopatikana ili kuboresha ubora wa makazi, na wajenzi-binafsi wa kipato cha juu wanaosimamiwa, wanaohitaji ubunifu wa upoaji bila umeme unaoweza kuunganishwa na viwango vya kisasa vya ujenzi. Kwa kushughulikia mahitaji ya pekee ya makundi haya, mradi unahakikisha unaweza kupanuka na kupokelewa katika tabaka mbalimbali za kiuchumi na kijamii.',
    'about.approach.heading': 'Mtazamo Wetu',
    'about.approach.body': 'Kwa kuunganisha R&D madhubuti na ushirikishaji wa jamii, ARC inaunga mkono njia bunifu na zinazoweza kupanuliwa za kuboresha faraja ya hali ya joto katika majengo katika hali ya hewa ya joto na unyevu, ikishughulikia mahitaji ya haraka na pia malengo ya muda mrefu ya uendelevu kwa watu wanaoishi katika maeneo yenye changamoto za kimazingira na kijamii-kiuchumi. Suluhu za ARC zinalenga kuunda mazingira baridi na ya raha ndani ya majengo bila kuhitaji vifaa vya upoaji na uondoaji unyevu vinavyotumia umeme.',
    'about.futureproof.heading': 'Kujiandaa kwa Mustakabali',
    'about.futureproof.body': 'Kadiri halijoto ya dunia inavyozidi kupanda na nchi zinazoathirika na tabianchi zinakabiliwa na joto kali zaidi na mvua kali za mara kwa mara, bila shaka utafika wakati ambapo upoaji bila umeme pekee hautatosha. Kwa kutambua hili, mtazamo wetu ni kuandaa miundo iweze kustahimili siku zijazo ili kuruhusu uwekaji rahisi wa mifumo ya upoaji na uondoaji unyevu inayotumia nishati kwa ufanisi. Hii inahakikisha kwamba majengo yanayoundwa leo hayatashughulikia tu mahitaji ya haraka ya wakaaji wake bali pia yatabaki yakiweza kuendana na hali ya tabianchi ya siku zijazo. Suluhu zinazoendelezwa zitaunganishwa na mifumo ya kisasa ya mitambo ili kupunguza matumizi ya nishati na gharama za uendeshaji, kwa kuepuka tatizo la kawaida la majengo yaliyoongezewa mifumo kutumia kiasi kikubwa kisicho endelevu cha nishati.',

    // contact.html
    'contact.heading': 'Wasiliana Nasi',
    'contact.touch.heading': 'Tuwasiliane',
    'contact.touch.body': 'Iwapo una nia ya utafiti wetu, ungependa kuchunguza fursa za ushirikiano, au una maswali kuhusu suluhu za upoaji bila umeme kwa hali ya hewa ya joto na unyevu, tafadhali wasiliana nasi kupitia fomu hii.',
    'contact.who.heading': 'Sisi Ni Nani',
    'contact.who.body': 'ARC inaongozwa na Andrew Simmonds wa <a href="https://simmondsmills.com" target="_blank" rel="noopener">Simmonds Mills</a>, kampuni ya R&D ya usanifu wa majengo iliyoko Uingereza, kwa ushirikiano na Kijiji cha Watoto cha Kiikolojia cha Al-Mizan kilichoko Tanzania.',
    'contact.follow.heading': 'Tufuate',
    'contact.follow.body': 'Pata habari za hivi karibuni za utafiti na miradi yetu kupitia <a href="https://www.linkedin.com/company/arc-cool-buildings" target="_blank" rel="noopener">LinkedIn</a>.',
    'contact.send.heading': 'Tuma Ujumbe',

    // Form fields
    'form.name': 'Jina',
    'form.email': 'Barua Pepe',
    'form.org': 'Kampuni / Shirika (si lazima)',
    'form.org_if': 'Kampuni/Shirika (kama inavyofaa)',
    'form.message': 'Ujumbe',
    'form.send': 'Tuma Ujumbe',
    'form.submit': 'Wasilisha',
    'form.contribution': 'Mchango Unaokadiriwa',
    'form.placeholder.name': 'Jina lako kamili',
    'form.placeholder.email': 'wewe@mfano.com',
    'form.placeholder.org': 'Shirika lako',
    'form.placeholder.message': 'Ujumbe wako',

    // privacy.html
    'privacy.heading': 'Sera ya Faragha',
    'privacy.lastUpdated': 'Mwisho kusasishwa: Machi 2026',
    'privacy.who.heading': 'Sisi ni nani',
    'privacy.who.body': 'Tovuti hii inaendeshwa na programu ya ARC Cool Buildings, mpango wa Simmonds Mills Architects. Anwani ya tovuti yetu ni <a href="https://actionresearchprojects.net">actionresearchprojects.net</a>.',
    'privacy.data.heading': 'Data tunayokusanya',
    'privacy.data.body': 'Hii ni tovuti tuli (static). Hatukusanyi, hatuhifadhi, wala hatutumii data yoyote ya kibinafsi kupitia tovuti hii. Hakuna akaunti za watumiaji, hakuna vidakuzi vya kufuatilia, na hakuna hati za uchanganuzi zinazokusanya taarifa za kibinafsi kutoka kwa wageni.',
    'privacy.cookies.heading': 'Vidakuzi',
    'privacy.cookies.body': 'Tovuti hii haitumii vidakuzi vyovyote.',
    'privacy.thirdparty.heading': 'Huduma za watu wa tatu',
    'privacy.thirdparty.body': 'Tovuti hii inatumia huduma zifuatazo za watu wa tatu, kila moja ikiwa na sera yake ya faragha:',
    'privacy.thirdparty.github.li': '<strong>GitHub Pages</strong> ina-host tovuti hii. GitHub inaweza kukusanya taarifa za kiufundi kama anwani za IP katika kumbukumbu za seva. Angalia <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">taarifa ya faragha ya GitHub</a>.',
    'privacy.thirdparty.google.li': '<strong>Google Fonts</strong> zinapakuliwa kutoka seva za Google. Angalia <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">sera ya faragha ya Google</a>.',
    'privacy.thirdparty.mapbox.li': '<strong>Mapbox</strong> hutumika kwenye ukurasa wa ramani ya miradi. Angalia <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener">sera ya faragha ya Mapbox</a>.',
    'privacy.external.heading': 'Viungo vya nje',
    'privacy.external.body': 'Tovuti hii ina viungo vya tovuti za nje, ikiwa ni pamoja na LinkedIn na GitHub. Hatuhusiki na utaratibu wa faragha wa tovuti hizo.',
    'privacy.contact.heading': 'Mawasiliano',
    'privacy.contact.body': 'Iwapo una maswali kuhusu sera hii ya faragha, unaweza kutuwasilia kupitia <a href="/contact">ukurasa wetu wa mawasiliano</a>.',
    'privacy.back': '← Rudi nyumbani',

    // support.html
    'support.heading': 'Tusaidie',
    'support.tagline': '<strong class="framer-text">Tusaidie kuendeleza mazoea ya ujenzi wa majengo yanayopoa na yenye afya pale yanapohitajika zaidi kwa haraka.</strong>',
    'support.smaller.heading': 'Kwa Michango Midogo',
    'support.larger.heading': 'Kwa Michango Mikubwa',
    'support.sponsors.heading': 'Wadhamini Wetu',
    'support.thanks': 'Asante!',
    'support.share': 'Njia nyingine ya kutusaidia ni kushiriki ARC kwenye mitandao ya kijamii.',
    'support.bank.intro1': 'Tunapokea uhamisho wa benki kwa michango midogo ili kuepuka ada za uchakataji zinazohusishwa',
    'support.bank.intro2': 'na majukwaa makuu. Ili kutusaidia, tafadhali tuma mchango wako kwenye akaunti ifuatayo:',
    'support.bank.details': 'Jina la Akaunti: ARC ARCHITECTURE FOR RESILIENT COMM<br class="framer-text">Sort Code: 08-92-99<br class="framer-text">Nambari ya Akaunti: 6338731700',
    'support.larger.intro': 'Wafadhili wetu wanatoka katika nyanja zote za maisha, na wanashirikiana na shauku ya ARC ya kufanya majengo yenye utendaji wa hali ya juu na yanayostahimili tabianchi yapatikane kwa wote. Tafadhali jaza fomu hapa chini ikiwa unafikiria kuunga mkono dhamira yetu.',

    // arc-standard.html
    'standard.underConstruction': 'Inajengwa',
    'standard.backHome': 'Rudi nyumbani',

    // 404.html
    'notFound.heading': 'Ukurasa haukupatikana',
    'notFound.body': 'Ukurasa unaoutafuta haupo au umehamishwa.',

    // blog/index.html
    'blog.title': 'Blogu ya ARC',
    'blog.backToSite': 'Rudi kwenye tovuti',
    'blog.updates': 'Habari Mpya',
    'blog.tagline': 'Habari za hivi karibuni kutoka ARC - Usanifu wa Majengo kwa Jamii Imara',
    'blog.loading': 'Inapakia machapisho...',
    'blog.allPosts': '← Machapisho yote',

    // ── Embedded sub-projects ──────────────────────────────────
    // projects-grid
    'pg.project1': 'Mradi 1',

    // CBG-grid
    'cbg.avoidingHeat': 'Kuepuka Joto',
    'cbg.keepingHeatOut': 'Kuzuia Joto Liingie',
    'cbg.airMovement': 'Mwendo wa Hewa',
    'cbg.coolingTheAir': 'Kupoza Hewa',
    'cbg.dryingTheAir': 'Kukausha Hewa',
    'cbg.thermalMass': 'Misa ya Joto',
    'cbg.practicalConstraints': 'Vikwazo vya Kivitendo',
    'cbg.environmentalPerformance': 'Utendaji wa Kimazingira',

    // science-grid
    'sg.module1': 'Moduli 1: Kiwango cha ARC kwa majengo baridi',
    'sg.module2': 'Moduli 2: Sababu za kimaumbile zinazoathiri faraja',
    'sg.module3': 'Moduli 3: Kupoza katika mawimbi ya joto',
    'sg.module4': "Moduli 4: Dhana ya 'kanda tatu' kwa majengo",
    'sg.module5': 'Moduli 5: Rasilimali',
    'sg.module6': 'Moduli 6: Kinga dhidi ya wadudu',
    'sg.module7': 'Moduli 7: Majaribio ya Sayansi ya Wananchi',

    // arc-people aria-labels
    'ap.prevImage': 'Picha iliyotangulia',
    'ap.nextImage': 'Picha inayofuata',
    'ap.openLink': 'Fungua kiungo cha nje',
    'ap.expandedView': 'Mwonekano uliopanuliwa',
    'ap.previous': 'Iliyotangulia',
    'ap.next': 'Inayofuata',

    // reflections-grid card titles
    'rg.expertAdvisor': 'Mshauri Mtaalamu: Huda Elsherif',
    'rg.shelyBegum': 'Shely Begum: Nyumba za Desh',
    'rg.house5php': 'Kijiji cha kiikolojia cha watoto wa Tanzania kinalenga kuhamasisha mfano wa kaboni ya chini',
    'rg.simmondsmills': 'SimmondsMills: Kijiji cha Kiikolojia Tanzania',
    'rg.scroll': '↓ Sogeza',

    // project-map UI controls
    'pm.showClimate': 'Onyesha Hali ya Hewa',
    'pm.climateOpacity': 'Uzito wa hali ya hewa',
    'pm.showLegend': 'Onyesha Maelezo',
  },
};
