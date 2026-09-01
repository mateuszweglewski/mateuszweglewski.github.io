// Content layout convention (keep new files consistent with this):
//   english/                                    — flat, all English worksheets/exams
//   webapps/<class>/laboratories/*.pdf           — practical labs, per class
//   webapps/<class>/lectures/*.pdf               — theory/slides (prezentacje), per class
// i.e. the file path under the repo root mirrors the site's URL path one-to-one
// (webapps/grade4/laboratories/foo.pdf is served at /webapps/grade4/laboratories/foo.pdf).
// Drop a new PDF in the matching folder, then add an entry to that node's `items`
// array below with a matching `url`.
window.SUBJECTS = {
  english: {
    key: 'english', name: 'English', icon: '🇬🇧', accent: '#7aa2ff',
    tagline: 'Grammar worksheets, mock matura exams & reading tasks',
    items: [
      { id:'1', title:'To be', author:'Mateusz Węglewski', year:2023, tags:['a1','a0'], description:'Elementary to be worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_to_be.pdf', format:'PDF' },
      { id:'2', title:'To have got', author:'Mateusz Węglewski', year:2023, tags:['a1','a0'], description:'Elementary to have got worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_to_have_got.pdf', format:'PDF' },
      { id:'3', title:'Plural forms', author:'Mateusz Węglewski', year:2023, tags:['a1','a0','a2'], description:'Regular and irregular plural forms worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_plurals.pdf', format:'PDF' },
      { id:'4', title:'The Present Simple Tense', author:'Mateusz Węglewski', year:2024, tags:['a1','a2','b1'], description:'The Present Simple tense worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_pr_simple.pdf', format:'PDF' },
      { id:'5', title:'The Present Progressive Tense', author:'Mateusz Węglewski', year:2024, tags:['a1','a2','b1'], description:'The Present Progressive tense worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_pr_prog.pdf', format:'PDF' },
      { id:'6', title:'Matura ZSM-E 2025 Poziom Podstawowy', author:'Mateusz Węglewski, Anita Drobisz-Węglewska', year:2025, tags:['b1','b2'], description:'Official mock matura exam - ZSM-E 2025', coverUrl:'/english/matura2025basic.png', url:'/english/matura_zsme_25_basic_bl.pdf', format:'PDF' },
      { id:'7', title:'Matura ZSM-E 2025 Poziom Rozszerzony', author:'Mateusz Węglewski, Anita Drobisz-Węglewska', year:2025, tags:['b1','b2'], description:'Official mock matura exam - ZSM-E 2025', coverUrl:'/english/matura2025extended.png', url:'/english/matura_zsme_25_extended_bl.pdf', format:'PDF' },
      { id:'8', title:'Demonstrative pronouns', author:'Mateusz Węglewski', year:2024, tags:['a0','a1'], description:'This/that/these/those worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_demonstratives.pdf', format:'PDF' },
      { id:'9', title:'Question tags', author:'Mateusz Węglewski', year:2023, tags:['b1','b2'], description:'Question tags worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_qtags.pdf', format:'PDF' },
      { id:'10', title:'Cleft sentences', author:'Mateusz Węglewski', year:2025, tags:['c1','c2'], description:'Cleft sentences worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_clefts.pdf', format:'PDF' },
      { id:'11', title:'Used', author:'Mateusz Węglewski', year:2024, tags:['a2','b1','b2','c1'], description:'Used to, Be used to, Get used to, Would, Present Simple worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_used.pdf', format:'PDF' },
      { id:'12', title:'Unreal Past', author:'Mateusz Węglewski', year:2024, tags:['b2','c1','c2'], description:'Unreal Past worksheet, including: wish, if only, as if/though, would rather/sooner, had better, suppose/supposing, prefer & rather expressions, conditionals', coverUrl:'/english/gog_cover.png', url:'/english/gog_unreal_p.pdf', format:'PDF' },
      { id:'13', title:'Correlative conjunctions', author:'Mateusz Węglewski', year:2024, tags:['b1','b2'], description:'Correlative conjunctions worksheet, including: both/and, either/or, neither/nor', coverUrl:'/english/gog_cover.png', url:'/english/gog_cor_coj.pdf', format:'PDF' },
      { id:'14', title:'Present Simple vs Present Progressive', author:'Mateusz Węglewski', year:2025, tags:['a2','b1','b2'], description:'Present Simple vs Present Progressive worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_pr_simple_pr_prog.pdf', format:'PDF' },
      { id:'15', title:'Passive Voice', author:'Mateusz Węglewski', year:2025, tags:['a2','b1','b2','c1'], description:'Passive Voice worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_passive.pdf', format:'PDF' },
      { id:'16', title:'Fronting', author:'Mateusz Węglewski', year:2025, tags:['c1','c2'], description:'Fronting worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_fronting.pdf', format:'PDF' },
      { id:'17', title:'The Present Perfect Simple Tense', author:'Mateusz Węglewski', year:2024, tags:['a2','b1'], description:'The Present Perfect Simple Tense worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_pr_per_simp.pdf', format:'PDF' },
      { id:'18', title:'Gradiation of adjectives', author:'Mateusz Węglewski', year:2026, tags:['a1','a2','b1','b2','c1'], description:'Gradiation of adjectives worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_grad_adj.pdf', format:'PDF' },
      { id:'19', title:'The Present Perfect Progressive Tense', author:'Mateusz Węglewski', year:2026, tags:['b1','b2'], description:'The Present Perfect Progressive Tense worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_pr_perf_prog.pdf', format:'PDF' },
      { id:'20', title:'Key Word Transformations - Extended Matura', author:'CKE', year:2026, tags:['b1','b2'], description:'Key Word Transformations - Extended Matura (categorised)', coverUrl:'', url:'/english/kwt_m_ex.pdf', format:'PDF' },
      { id:'21', title:'Modal Verbs', author:'Mateusz Węglewski', year:2026, tags:['a1','a2','b1','b2','c1'], description:'Modal verbs worksheet', coverUrl:'/english/gog_cover.png', url:'/english/gog_modals.pdf', format:'PDF' }
    ]
  },
  webapps: {
    key: 'webapps', name: 'Web Apps', icon: '💻', accent: '#ff9e64',
    tagline: 'ZSM-E Zywiec 2026/2027 materials',
    childLabel: 'Class',
    children: {
      grade4: {
        key: 'grade4', name: '4th grade', icon: '🎓', accent: '#ff9e64',
        tagline: 'Web Apps — 4th grade materials',
        childLabel: 'Category',
        children: {
          laboratories: {
            key: 'laboratories', name: 'Laboratories', icon: '🧪', accent: '#ff9e64',
            tagline: 'Hands-on lab exercises',
            logoUrl: '/webapps/logo_labs.png',
            items: [
              { id:'wa-lab-0-g4', title:'Lab 0', author:'Mateusz Węglewski', year:2026, tags:[], description:'Introductory laboratory exercise', coverUrl:'', url:'/webapps/grade4/laboratories/WA_Lab_0.pdf', format:'PDF' }
            ]
          },
          lectures: {
            key: 'lectures', name: 'Lectures', icon: '📖', accent: '#ff9e64',
            tagline: 'Lecture notes & slides',
            logoUrl: '/webapps/logo_lectures.png',
            items: []
          }
        }
      },
      grade5: {
        key: 'grade5', name: '5th grade', icon: '🎓', accent: '#ff9e64',
        tagline: 'Web Apps — 5th grade materials',
        childLabel: 'Category',
        children: {
          laboratories: {
            key: 'laboratories', name: 'Laboratories', icon: '🧪', accent: '#ff9e64',
            tagline: 'Hands-on lab exercises',
            logoUrl: '/webapps/logo_labs.png',
            items: [
              { id:'wa-lab-0-g5', title:'Lab 0', author:'Mateusz Węglewski', year:2026, tags:[], description:'Introductory laboratory exercise', coverUrl:'', url:'/webapps/grade5/laboratories/WA_Lab_0.pdf', format:'PDF' }
            ]
          },
          lectures: {
            key: 'lectures', name: 'Lectures', icon: '📖', accent: '#ff9e64',
            tagline: 'Lecture notes & slides',
            logoUrl: '/webapps/logo_lectures.png',
            items: []
          }
        }
      }
    }
  }
};