// ベースマップの設定
export const baseMap = {
    id: "modern",
    name: "現代 (地理院地図)",
    url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    attribution: "地理院地図┃現在の日本の標準的な地図です。最新の道路、建物、地形が正確に反映されており、古地図と比較する際の基準（ベースマップ）となります。"
};

// 重ねる古地図のリスト
// `addedAt: "YYYY-MM-DD"` を付けると、追加から 7 日間 UI に NEW が表示されます。
// タイル URL が複数に分かれている地図は `url` の代わりに `urls: ["...","..."]` を使えます。
export const overlays = [
    {
        id: "hillshade",
        name: "地形の凹凸 (陰影起伏図)",
        year: "地形",
        url: "https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png",
        description: "国土地理院┃地面の凸凹だけを強調した地図です。古地図の下に敷くと、旭川の自然堤防や岡山城が『少し高い場所』にあることが立体的に分かります。",
        defaultOpacity: 0.4,
        zIndex: 30,
        addedAt: "2026-03-08"
    },
    {
        id: "relief",
        name: "色別標高図",
        year: "地形",
        url: "https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png",
        description: "国土地理院┃標高によって色分けされた地図。干拓地がいかに海抜の低い場所にあるか、かつての島々がどこだったかが一目で分かります。",
        defaultOpacity: 0.4,
        zIndex: 31,
        addedAt: "2026-03-08"
    },
    {
        id: "chisui_bunruizu",
        name: "平安〜戦国マップ (吉備の穴海)",
        year: "∞",
        url: "https://cyberjapandata.gsi.go.jp/xyz/lcm25k_2012/{z}/{x}/{y}.png",
        description: "国土地理院 (治水地形分類図)。江戸時代以前の岡山を推測するモード。紫色のエリアをすべて『海』、水色の筋を『川』と見なすと、児島が島だった頃の『吉備の穴海』の姿が見えてきます。",
        defaultOpacity: 0.8,
        zIndex: 140,
        addedAt: "2026-03-01"
    },
    {
        id: "1660_ikeda",
        name: "岡山城周辺地図(池田家岡山古図)",
        year: 1660,
        url: "https://mapwarper.h-gis.jp/maps/tile/5139/{z}/{x}/{y}.png",
        attribution: "この地図は1800年に原田茂嘉によって写されたものです。1660年頃の岡山の姿を伝えています。一部、道や名前に書き間違いの可能性があるとされていますが、当時の貴重な資料を忠実に再現したものです",
        defaultOpacity: 0.5,
        zIndex: 50,
        addedAt: "2026-03-01"
    },
    {
        id: "1880_meiji",
        name: "明治期の海岸線",
        year: 1880,
        url: "https://cyberjapandata.gsi.go.jp/xyz/swale/{z}/{x}/{y}.png",
        attribution: "明治期の古い地形図を基に、当時の湿地、水域などを可視化したデータ。昭和以降の大規模な埋め立てが行われる前の「自然に近い海岸線」を知る手がかりとなります。",
        defaultOpacity: 0.5,
        zIndex: 50,
        addedAt: "2026-03-01"
    },
    // {
    //     id: "1888_meiji_std",
    //     name: "明治・大正の地形図 (詳細版)",
    //     year: 1888,
    //     // re_old80 より re_old10 のほうが都市部のデータが豊富です
    //     url: "https://cyberjapandata.gsi.go.jp/xyz/re_old10/{z}/{x}/{y}.png",
    //     description: "国土地理院┃近代測量による詳細な地形図。岡山駅が開業した頃の姿です。ズームレベル12〜17で表示されます。",
    //     defaultOpacity: 0.7,
    //     zIndex: 60,
    //     minZoom: 12,
    //     maxNativeZoom: 17, // これ以上ズームすると消えるのを防ぐ
    //     addedAt: "2026-03-08"
    // },
    {
        id: "1897_meiji",
        name: "明治30年の地図",
        year: 1897,
        urls: [
            "https://mapwarper.h-gis.jp/maps/tile/711/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/710/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/712/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/713/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/733/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/734/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/735/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/736/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/756/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/757/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/758/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/759/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/779/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/780/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/781/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/782/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/806/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/807/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/808/{z}/{x}/{y}.png",
            "https://mapwarper.h-gis.jp/maps/tile/809/{z}/{x}/{y}.png"
        ],
        attribution: "明治30年〜陸軍参謀本部により測図された地図。現在の30号線沿いまで陸地が拡大している。スタンフォード大学のデータベースに掲載されている。",
        defaultOpacity: 0.5,
        zIndex: 50,
        addedAt: "2026-03-08"
    },
    // {
    //     id: "kojima1_7",
    //     name: "児島湾干拓変遷(1-7区)",
    //     year: 1900,
    //     url: "https://mapwarper.h-gis.jp/maps/tile/1025/{z}/{x}/{y}.png",
    //     attribution: "児島湾干拓の変遷を示す図。江戸から明治にかけて、沖新田よりさらに南へと陸地が広がっていく過程が分かります。",
    //     defaultOpacity: 0.6,
    //     zIndex: 61,
    //     addedAt: "2026-03-08"
    // },
    // {
    //     id: "kojima8_9",
    //     name: "児島湾干拓最終期(8-9区)",
    //     year: 1950,
    //     url: "https://mapwarper.h-gis.jp/maps/tile/3156/{z}/{x}/{y}.png",
    //     attribution: "昭和20年代、児島湖が生まれる直前の干拓最終段階の図。今の南区の形が完成する直前の姿です。",
    //     defaultOpacity: 0.6,
    //     zIndex: 62,
    //     addedAt: "2026-03-08"
    // },
    {
        id: "1945_aerial_v2",
        name: "航空写真 (1945-50)",
        year: 1945,
        url: "https://cyberjapandata.gsi.go.jp/xyz/ort_USA10/{z}/{x}/{y}.png", 
        attribution: "国土地理院┃戦後直後の米軍撮影による航空写真です。1945〜50年当時の岡山の姿を詳細に映し出します。",
        defaultOpacity: 0.8,
        zIndex: 150,
        maxNativeZoom: 17,
        maxZoom: 20,
        addedAt: "2026-03-01"
    },
    {
        id: "1961_aerial",
        name: "航空写真 (1961-69)",
        year: 1961,
        url: "https://cyberjapandata.gsi.go.jp/xyz/ort_old10/{z}/{x}/{y}.png",
        description: "国土地理院┃高度経済成長期の岡山。新幹線の建設や、市街地の急激な拡大、児島湾の干拓完了後の姿が見て取れます。",
        defaultOpacity: 0.8,
        zIndex: 145,
        maxNativeZoom: 17,
        addedAt: "2026-03-08"
    },
    {
        id: "1974_picture",
        name: "航空写真 (1974-78)",
        year: 1974,
        url: "https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg",
        description: "国土地理院┃昭和40年代後半から50年代前半の岡山。現代に近いインフラが整い、干拓地も農地から住宅地・工業地へと変化しています。",
        defaultOpacity: 0.8,
        zIndex: 140,
        addedAt: "2026-03-01"
    }
];
