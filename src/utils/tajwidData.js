export const TAJWID_COLOR_KEY = 'murojaah-tajwid-color'
export const TAJWID_PROGRESS_KEY = 'murojaah-tajwid-progress'

const tajwidAccents = {
  cyan: { text: '#a5f3fc', border: 'rgba(103,232,249,.28)', background: 'rgba(103,232,249,.09)' },
  emerald: { text: '#a7f3d0', border: 'rgba(52,211,153,.28)', background: 'rgba(52,211,153,.09)' },
  rose: { text: '#fecdd3', border: 'rgba(251,113,133,.28)', background: 'rgba(251,113,133,.09)' },
  violet: { text: '#ddd6fe', border: 'rgba(196,181,253,.28)', background: 'rgba(196,181,253,.09)' },
}

export function getTajwidAccent(color = 'cyan') {
  return tajwidAccents[color] ?? tajwidAccents.cyan
}

export const tajwidChapters = [
  {
    id: 'makharij',
    title: 'Makharijul Huruf',
    arabic: 'مخارج الحروف',
    description: 'Kenali lima tempat utama keluarnya huruf hijaiyah.',
    rules: [
      { id: 'jawf', title: 'Al-Jauf · rongga mulut', arabic: 'الجوف', definition: 'Rongga mulut menjadi tempat keluarnya huruf mad: alif, wau, dan ya yang sukun setelah harakat yang sesuai.', letters: ['ا', 'وْ', 'يْ'], example: 'قَالُوا', reference: 'Al-Baqarah · 2:11', breakdown: 'Alif setelah fathah, wau setelah dammah, dan ya setelah kasrah dibaca dari rongga mulut.' },
      { id: 'halq', title: 'Al-Halq · tenggorokan', arabic: 'الحلق', definition: 'Tenggorokan memiliki tiga area makhraj untuk enam huruf: pangkal, tengah, dan ujung tenggorokan.', letters: ['ء', 'ه', 'ع', 'ح', 'غ', 'خ'], example: 'الْحَمْدُ', reference: 'Al-Fatihah · 1:2', breakdown: 'Huruf ح pada الْحَمْدُ keluar dari bagian tengah tenggorokan.' },
      { id: 'lisan', title: 'Al-Lisan · lidah', arabic: 'اللسان', definition: 'Sebagian besar huruf Arab keluar dari berbagai bagian lidah yang bertemu langit-langit atau gigi.', letters: ['ق', 'ك', 'ج', 'ش', 'ي', 'ض', 'ل', 'ن', 'ر', 'ط', 'د', 'ت', 'ص', 'س', 'ز', 'ظ', 'ذ', 'ث'], example: 'قُلْ', reference: 'Al-Ikhlas · 112:1', breakdown: 'Huruf ق berasal dari pangkal lidah yang mendekati langit-langit bagian atas.' },
      { id: 'shafatan', title: 'Asy-Syafatain · dua bibir', arabic: 'الشفتان', definition: 'Huruf tertentu keluar dari pertemuan dua bibir, sedangkan fa keluar dari bibir bawah bersama ujung gigi atas.', letters: ['ف', 'ب', 'م', 'و'], example: 'لَمْ يَلِدْ', reference: 'Al-Ikhlas · 112:3', breakdown: 'Huruf م dan ب melibatkan pertemuan kedua bibir.' },
      { id: 'khayshum', title: 'Al-Khaysyum · rongga hidung', arabic: 'الخيشوم', definition: 'Rongga hidung menjadi tempat keluarnya suara dengung (ghunnah), terutama pada nun dan mim bertasydid.', letters: ['نّ', 'مّ'], example: 'إِنَّا', reference: 'Al-Kautsar · 108:1', breakdown: 'Dengung pada nun bertasydid ditahan dengan lembut sekitar dua harakat.' },
    ],
  },
  {
    id: 'sifat',
    title: 'Sifatul Huruf',
    arabic: 'صفات الحروف',
    description: 'Pelajari karakter bunyi agar setiap huruf terdengar jelas.',
    rules: [
      { id: 'hams-jahr', title: 'Hams dan Jahr', arabic: 'الهمس والجهر', definition: 'Hams adalah mengalirnya napas saat huruf diucapkan; jahr menahan aliran napas. Huruf hams dirangkum dalam فَحَثَّهُ شَخْصٌ سَكَتْ.', letters: ['ف', 'ح', 'ث', 'ه', 'ش', 'خ', 'ص', 'س', 'ك', 'ت'], example: 'الصِّرَاطَ', reference: 'Al-Fatihah · 1:6', breakdown: 'ص termasuk huruf hams; keluarkan napas dengan jelas tanpa mengubah makhraj.' },
      { id: 'shiddah', title: 'Syiddah, Tawassuth, Rikhwah', arabic: 'الشدة والتوسط والرخاوة', definition: 'Sifat ini menjelaskan kuat atau mengalirnya suara: tertahan pada syiddah, sedang pada tawassuth, dan mengalir pada rikhwah.', letters: ['أ', 'ج', 'د', 'ق', 'ط', 'ب', 'ك', 'ت'], example: 'قَدْ أَفْلَحَ', reference: 'Al-Mu’minun · 23:1', breakdown: 'Pada دْ, suara tertahan sejenak karena huruf dal memiliki sifat syiddah.' },
      { id: 'istila', title: 'Isti’la dan Istifal', arabic: 'الاستعلاء والاستفال', definition: 'Huruf isti’la diucapkan dengan pangkal lidah terangkat sehingga bunyinya tebal. Huruf selainnya pada dasarnya bersifat istifal.', letters: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'], example: 'الصِّرَاطَ', reference: 'Al-Fatihah · 1:6', breakdown: 'ص termasuk huruf isti’la dan dibaca tebal.' },
      { id: 'itbaq', title: 'Itbaq dan Infitah', arabic: 'الإطباق والانفتاح', definition: 'Itbaq terjadi saat lidah mendekat ke langit-langit ketika mengucapkan ص ض ط ظ; huruf lainnya bersifat infitah.', letters: ['ص', 'ض', 'ط', 'ظ'], example: 'الضَّالِّينَ', reference: 'Al-Fatihah · 1:7', breakdown: 'ض termasuk huruf itbaq; jaga kualitas bunyi tebalnya.' },
      { id: 'safir', title: 'Safir', arabic: 'الصفير', definition: 'Safir adalah bunyi desis yang menyertai pengucapan huruf ص, ز, dan س.', letters: ['ص', 'ز', 'س'], example: 'وَالنَّاسِ', reference: 'An-Nas · 114:6', breakdown: 'س dibaca dengan desis yang jernih dari ujung lidah, bukan dengan menambah huruf.' },
      { id: 'takrir', title: 'Takrir', arabic: 'التكرير', definition: 'Ra memiliki sifat takrir, yaitu kesiapan ujung lidah untuk bergetar. Jaga agar getarannya tidak berlebihan.', letters: ['ر'], example: 'الرَّحْمَٰنِ', reference: 'Al-Fatihah · 1:3', breakdown: 'Ucapkan ra dengan jelas dan terkendali; jangan menggulungnya berkali-kali.' },
      { id: 'tafashshi', title: 'Tafasysyi', arabic: 'التفشي', definition: 'Tafasysyi adalah menyebarnya suara syin di dalam mulut saat huruf ش diucapkan.', letters: ['ش'], example: 'الشَّيْطَانُ', reference: 'Al-Baqarah · 2:36', breakdown: 'Biarkan desis syin menyebar sewajarnya tanpa mengubahnya menjadi huruf lain.' },
      { id: 'inhiraf-istitalah', title: 'Inhiraf dan Istithalah', arabic: 'الانحراف والاستطالة', definition: 'Lam dan ra memiliki sifat inhiraf (bunyi condong), sedangkan ض memiliki sifat istithalah (bunyi memanjang di sisi lidah).', letters: ['ل', 'ر', 'ض'], example: 'الضَّالِّينَ', reference: 'Al-Fatihah · 1:7', breakdown: 'Jaga istithalah pada ض dan jangan menggantinya dengan bunyi د atau ظ.' },
      { id: 'qalqalah-sifat', title: 'Qalqalah', arabic: 'القلقلة', definition: 'Huruf qalqalah memantulkan bunyi ketika sukun. Hurufnya terkumpul dalam قُطْبُ جَدٍّ.', letters: ['ق', 'ط', 'ب', 'ج', 'د'], example: 'قَدْ أَفْلَحَ', reference: 'Al-Mu’minun · 23:1', breakdown: 'Dal sukun dipantulkan ringan tanpa menambahkan harakat.' },
    ],
  },
  {
    id: 'nun-sukun',
    title: 'Nun Sukun & Tanwin',
    arabic: 'النون الساكنة والتنوين',
    description: 'Pelajari hukum nun sukun dan tanwin saat bertemu huruf berikutnya.',
    rules: [
      { id: 'izhar-halqi', title: 'Izhar Halqi', arabic: 'الإظهار الحلقي', color: 'cyan', definition: 'Nun sukun atau tanwin dibaca jelas ketika bertemu salah satu huruf tenggorokan: ء ه ع ح غ خ.', letters: ['ء', 'ه', 'ع', 'ح', 'غ', 'خ'], example: 'مِنْ أَنْفُسِكُمْ', reference: 'At-Tawbah · 9:128', breakdown: 'Nun sukun bertemu hamzah, salah satu huruf halqi, sehingga dibaca jelas.' },
      { id: 'idgham-bighunnah', title: 'Idgham Bighunnah', arabic: 'الإدغام بغنة', color: 'emerald', definition: 'Nun sukun atau tanwin melebur ke huruf ي ن م و disertai dengung. Pengecualian penting: dalam satu kata seperti الدُّنْيَا, dibaca izhar mutlak.', letters: ['ي', 'ن', 'م', 'و'], example: 'مَن يَعْمَلْ', reference: 'An-Nisa · 4:123', breakdown: 'Nun sukun bertemu ya pada dua kata; leburkan dengan dengung.' },
      { id: 'idgham-bilaghunnah', title: 'Idgham Bilaghunnah', arabic: 'الإدغام بلا غنة', color: 'emerald', definition: 'Nun sukun atau tanwin melebur ke lam atau ra tanpa dengung.', letters: ['ل', 'ر'], example: 'مِن رَّبِّهِمْ', reference: 'Al-Baqarah · 2:5', breakdown: 'Nun sukun bertemu ra; leburkan tanpa dengung.' },
      { id: 'iqlab', title: 'Iqlab', arabic: 'الإقلاب', color: 'rose', definition: 'Nun sukun atau tanwin yang bertemu ba diubah menjadi bunyi mim samar disertai dengung.', letters: ['ب'], example: 'مِن بَعْدِ', reference: 'Al-Baqarah · 2:27', breakdown: 'Nun sukun bertemu ba; bunyikan mim samar dengan dengung.' },
      { id: 'ikhfa-haqiqi', title: 'Ikhfa Haqiqi', arabic: 'الإخفاء الحقيقي', color: 'violet', definition: 'Nun sukun atau tanwin disamarkan ketika bertemu salah satu dari 15 huruf ikhfa, dengan dengung.', letters: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'], example: 'مِن شَرِّ', reference: 'Al-Falaq · 113:2', breakdown: 'Nun sukun bertemu syin; samarkan nun dengan dengung.' },
    ],
  },
  {
    id: 'mim-sukun',
    title: 'Mim Sukun',
    arabic: 'الميم الساكنة',
    description: 'Kenali tiga hukum mim sukun berdasarkan huruf sesudahnya.',
    rules: [
      { id: 'ikhfa-syafawi', title: 'Ikhfa Syafawi', arabic: 'الإخفاء الشفوي', color: 'violet', definition: 'Mim sukun bertemu ba dibaca samar di bibir dengan dengung.', letters: ['ب'], example: 'تَرْمِيهِم بِحِجَارَةٍ', reference: 'Al-Fil · 105:4', breakdown: 'Mim sukun bertemu ba; rapatkan bibir dengan lembut dan dengungkan.' },
      { id: 'idgham-mimi', title: 'Idgham Mimi', arabic: 'الإدغام المتماثلين الصغير', color: 'emerald', definition: 'Mim sukun bertemu mim berharakat; keduanya melebur menjadi mim bertasydid dengan dengung.', letters: ['م'], example: 'عَلَيْهِم مُّؤْصَدَةٌ', reference: 'Al-Humazah · 104:8', breakdown: 'Mim sukun bertemu mim; leburkan dan dengungkan.' },
      { id: 'izhar-syafawi', title: 'Izhar Syafawi', arabic: 'الإظهار الشفوي', color: 'cyan', definition: 'Mim sukun dibaca jelas ketika bertemu huruf selain mim dan ba. Perhatikan kejelasan mim sebelum fa dan wau.', letters: ['ء', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'ن', 'ه', 'و', 'ي'], example: 'لَكُمْ دِينُكُمْ', reference: 'Al-Kafirun · 109:6', breakdown: 'Mim sukun bertemu dal; mim dibaca jelas.' },
    ],
  },
  {
    id: 'ghunnah',
    title: 'Mim & Nun Tasydid',
    arabic: 'النون والميم المشددتان',
    description: 'Latih dengung pada nun dan mim bertasydid.',
    rules: [
      { id: 'ghunnah-musaddadah', title: 'Ghunnah Musyaddadah', arabic: 'الغنة المشددة', color: 'emerald', definition: 'Nun atau mim bertasydid wajib dibaca dengan dengung yang sempurna sekitar dua harakat.', letters: ['نّ', 'مّ'], example: 'إِنَّا أَعْطَيْنَاكَ', reference: 'Al-Kautsar · 108:1', breakdown: 'Nun bertasydid pada إِنَّا dibaca dengan dengung sekitar dua harakat.' },
    ],
  },
  {
    id: 'lam-taarif',
    title: 'Alif Lam / Lam Ta’rif',
    arabic: 'لام التعريف',
    description: 'Bedakan lam qamariyah yang jelas dan lam syamsiyah yang melebur.',
    rules: [
      { id: 'qamariyah', title: 'Alif Lam Qamariyah', arabic: 'اللام القمرية', color: 'cyan', definition: 'Lam pada ال dibaca jelas ketika bertemu salah satu huruf qamariyah: ا ب ج ح خ ع غ ف ق ك م ه و ي.', letters: ['ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'ه', 'و', 'ي'], example: 'الْحَمْدُ', reference: 'Al-Fatihah · 1:2', breakdown: 'Lam dibaca jelas sebelum ح.' },
      { id: 'syamsiyah', title: 'Alif Lam Syamsiyah', arabic: 'اللام الشمسية', color: 'rose', definition: 'Lam pada ال melebur ke huruf syamsiyah dan huruf berikutnya dibaca bertasydid.', letters: ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'], example: 'الشَّمْسِ', reference: 'Asy-Syams · 91:1', breakdown: 'Lam tidak terdengar; syin dibaca bertasydid.' },
    ],
  },
  {
    id: 'mad',
    title: 'Hukum Mad',
    arabic: 'أحكام المد',
    description: 'Pahami mad thabi’i dan 13 cabang mad far’i.',
    rules: [
      { id: 'mad-thabii', title: 'Mad Thabi’i', arabic: 'المد الطبيعي', definition: 'Huruf mad ا و ي yang tidak diikuti hamzah atau sukun dibaca dua harakat.', letters: ['ا', 'و', 'ي'], example: 'قَالُوا', reference: 'Al-Baqarah · 2:11', breakdown: 'Alif mad pada قَالُوا dipanjangkan dua harakat.' },
      { id: 'mad-wajib-muttasil', title: 'Mad Wajib Muttasil', arabic: 'المد الواجب المتصل', definition: 'Huruf mad bertemu hamzah dalam satu kata. Panjangnya mengikuti riwayat bacaan yang dipelajari; pada Hafs umumnya empat atau lima harakat.', letters: ['آ', 'ء'], example: 'جَاءَ', reference: 'Al-Baqarah · 2:87', breakdown: 'Huruf mad bertemu hamzah dalam satu kata.' },
      { id: 'mad-jaiz-munfasil', title: 'Mad Jaiz Munfasil', arabic: 'المد الجائز المنفصل', definition: 'Huruf mad di akhir kata bertemu hamzah di awal kata berikutnya. Panjangnya mengikuti riwayat; Hafs dari jalur umum dibaca empat atau lima harakat, dan ada jalur dua harakat.', letters: ['آ', 'ء'], example: 'بِمَا أُنزِلَ', reference: 'Al-Baqarah · 2:4', breakdown: 'Alif mad di بِمَا bertemu hamzah di awal أُنزِلَ.' },
      { id: 'mad-lazim-kalimi-muthaqqal', title: 'Mad Lazim Kalimi Mutsaqqal', arabic: 'المد اللازم الكلمي المثقل', definition: 'Huruf mad bertemu sukun asli yang bertasydid dalam satu kata; dibaca enam harakat.', letters: ['آ', 'ّ'], example: 'الضَّالِّينَ', reference: 'Al-Fatihah · 1:7', breakdown: 'Alif mad bertemu lam bertasydid dengan sukun asli.' },
      { id: 'mad-lazim-kalimi-mukhaffaf', title: 'Mad Lazim Kalimi Mukhaffaf', arabic: 'المد اللازم الكلمي المخفف', definition: 'Huruf mad bertemu sukun asli tanpa tasydid dalam satu kata; dibaca enam harakat. Contohnya terdapat pada lafaz ءَآلْآنَ.', letters: ['آ', 'لْ'], example: 'ءَآلْآنَ', reference: 'Yunus · 10:51', breakdown: 'Mad bertemu lam sukun asli tanpa tasydid; dibaca enam harakat.' },
      { id: 'mad-lazim-harfi-muthaqqal', title: 'Mad Lazim Harfi Mutsaqqal', arabic: 'المد اللازم الحرفي المثقل', definition: 'Pada huruf muqaththa’ah, mad pada nama huruf bertemu sukun yang melebur ke huruf berikutnya; dibaca enam harakat.', letters: ['ل', 'م'], example: 'الم', reference: 'Al-Baqarah · 2:1', breakdown: 'Pada nama huruf لَامْ, mim sukun melebur ke mim berikutnya.' },
      { id: 'mad-lazim-harfi-mukhaffaf', title: 'Mad Lazim Harfi Mukhaffaf', arabic: 'المد اللازم الحرفي المخفف', definition: 'Mad pada nama huruf muqaththa’ah bertemu sukun asli tanpa idgham; dibaca enam harakat.', letters: ['قٓ'], example: 'قٓ', reference: 'Qaf · 50:1', breakdown: 'Nama huruf ق dibaca قَافْ dengan mad enam harakat.' },
      { id: 'mad-arid-lissukun', title: 'Mad ‘Aridh Lissukun', arabic: 'المد العارض للسكون', definition: 'Saat waqaf, huruf terakhir menjadi sukun sementara setelah huruf mad. Boleh dibaca dua, empat, atau enam harakat.', letters: ['ا', 'و', 'ي'], example: 'الْعَالَمِينَ', reference: 'Al-Fatihah · 1:2', breakdown: 'Jika berhenti di الْعَالَمِينَ, pilih dua, empat, atau enam harakat secara konsisten.' },
      { id: 'mad-lin', title: 'Mad Lin', arabic: 'مد اللين', definition: 'Wau atau ya sukun setelah fathah dibaca lunak; ketika waqaf, boleh dipanjangkan dua, empat, atau enam harakat.', letters: ['وْ', 'يْ'], example: 'خَوْفٍ', reference: 'Quraisy · 106:4', breakdown: 'Jika berhenti pada خَوْفٍ, bunyi wau lin dipanjangkan sesuai pilihan.' },
      { id: 'mad-badal', title: 'Mad Badal', arabic: 'مد البدل', definition: 'Hamzah mendahului huruf mad dalam satu kata; pada riwayat Hafs dibaca dua harakat.', letters: ['آ', 'إِي', 'أُو'], example: 'آمَنُوا', reference: 'Al-Baqarah · 2:3', breakdown: 'Hamzah mendahului alif mad; baca dua harakat.' },
      { id: 'mad-silah-qasirah', title: 'Mad Shilah Qashirah', arabic: 'مد الصلة الصغرى', definition: 'Ha dhamir tunggal berharakat berada di antara dua huruf berharakat dan tidak diikuti hamzah; dibaca dua harakat saat washal.', letters: ['هُ', 'هِ'], example: 'إِنَّهُ كَانَ', reference: 'Al-Isra · 17:44', breakdown: 'Ha dhamir pada إِنَّهُ berada di antara huruf berharakat dan tidak diikuti hamzah.' },
      { id: 'mad-silah-tawilah', title: 'Mad Shilah Thawilah', arabic: 'مد الصلة الكبرى', definition: 'Ha dhamir memenuhi syarat shilah dan diikuti hamzah; dipanjangkan seperti mad munfasil menurut riwayat.', letters: ['هُ', 'هِ', 'ء'], example: 'مَالَهُ أَخْلَدَهُ', reference: 'Al-Humazah · 104:3', breakdown: 'Ha dhamir pada مَالَهُ diikuti hamzah pada أَخْلَدَهُ.' },
      { id: 'mad-iwad', title: 'Mad ‘Iwad', arabic: 'مد العوض', definition: 'Ketika waqaf pada kata bertanwin fathah, tanwin diganti bunyi alif mad dua harakat, kecuali ta marbuthah.', letters: ['ً'], example: 'سَمِيعًا', reference: 'An-Nisa · 4:58', breakdown: 'Jika waqaf pada سَمِيعًا, tanwin fathah diganti mad dua harakat.' },
      { id: 'mad-tamkin', title: 'Mad Tamkin', arabic: 'مد التمكين', definition: 'Mad dua harakat untuk memisahkan dua ya agar ya bertasydid tetap jelas dan tidak melebur.', letters: ['يّ', 'ي'], example: 'النَّبِيِّينَ', reference: 'Al-Baqarah · 2:61', breakdown: 'Jaga mad pada ya sebelum ya bertasydid agar keduanya terdengar jelas.' },
    ],
  },
  {
    id: 'qalqalah',
    title: 'Qalqalah',
    arabic: 'القلقلة',
    description: 'Latih pantulan ringan pada lima huruf qalqalah yang sukun.',
    rules: [
      { id: 'qalqalah-sughra', title: 'Qalqalah Sugra', arabic: 'القلقلة الصغرى', definition: 'Huruf ق ط ب ج د yang bersukun di tengah bacaan dipantulkan dengan ringan.', letters: ['ق', 'ط', 'ب', 'ج', 'د'], example: 'قَدْ أَفْلَحَ', reference: 'Al-Mu’minun · 23:1', breakdown: 'Dal sukun di tengah bacaan dipantulkan ringan, tidak diberi harakat tambahan.' },
      { id: 'qalqalah-kubra', title: 'Qalqalah Kubra', arabic: 'القلقلة الكبرى', definition: 'Pantulan terdengar lebih kuat ketika berhenti pada huruf qalqalah di akhir kata; jangan menambahkan vokal.', letters: ['ق', 'ط', 'ب', 'ج', 'د'], example: 'الْفَلَقِ', reference: 'Al-Falaq · 113:1', breakdown: 'Jika waqaf pada الْفَلَقِ, ق menjadi sukun dan dipantulkan lebih kuat.' },
    ],
  },
  {
    id: 'ra-waqaf',
    title: 'Hukum Ra & Waqaf/Ibtida’',
    arabic: 'أحكام الراء والوقف والابتداء',
    description: 'Pahami bacaan ra tebal-tipis dan tanda berhenti dasar.',
    rules: [
      { id: 'ra-tafkhim', title: 'Ra Tafkhim', arabic: 'تفخيم الراء', definition: 'Ra umumnya dibaca tebal ketika berharakat fathah atau dammah, serta pada beberapa keadaan ra sukun.', letters: ['رَ', 'رُ'], example: 'رَبِّ الْعَالَمِينَ', reference: 'Al-Fatihah · 1:2', breakdown: 'Ra berharakat fathah pada رَبِّ dibaca tebal.' },
      { id: 'ra-tarqiq', title: 'Ra Tarqiq', arabic: 'ترقيق الراء', definition: 'Ra berharakat kasrah dibaca tipis. Ra sukun setelah kasrah asli juga memiliki aturan tipis dengan beberapa pengecualian.', letters: ['رِ', 'رْ'], example: 'فِرْعَوْنَ', reference: 'Al-Baqarah · 2:49', breakdown: 'Ra sukun didahului kasrah asli; baca tipis sesuai kaidah dan konteksnya.' },
      { id: 'waqaf', title: 'Tanda Waqaf', arabic: 'علامات الوقف', definition: 'Tanda waqaf membantu memilih tempat berhenti. Ketuk salah satu tanda untuk melihat kemunculannya dalam teks mushaf. Makna dan cara berhenti mengikuti tanda mushaf serta bimbingan guru.', letters: ['ۘ', 'ۖ', 'ۗ', 'ۚ', 'ۙ', 'ۛ', 'ۜ'], example: 'فَلَا تَقُلْ لَهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا', reference: 'Al-Isra · 17:23', breakdown: 'Jangan berhenti sembarang hingga memutus makna; ikuti tanda mushaf dan bimbingan guru.' },
      { id: 'ibtida', title: 'Ibtida’ yang Baik', arabic: 'الابتداء', definition: 'Ibtida’ adalah memulai kembali bacaan dari tempat yang menjaga susunan dan makna. Jika berhenti karena napas, ulangi dari bagian sebelumnya bila perlu.', letters: ['و', 'ف', 'ثم'], example: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', reference: 'Al-Fatihah · 1:5', breakdown: 'Awali kembali dari potongan yang maknanya utuh dan tidak menggantung pada kata sebelumnya.' },
    ],
  },
]

export const allTajwidRules = tajwidChapters.flatMap((chapter) => (
  chapter.rules.map((rule) => ({ ...rule, chapterId: chapter.id, chapterTitle: chapter.title }))
))

export function getTajwidChapter(chapterId) {
  return tajwidChapters.find((chapter) => chapter.id === chapterId) ?? tajwidChapters[0]
}
