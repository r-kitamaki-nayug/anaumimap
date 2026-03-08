// ベースマップの設定
export const baseMap = {
    id: "modern",
    name: "現代 (地理院地図)",
    url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    attribution: "地理院地図┃現在の日本の標準的な地図です。最新の道路、建物、地形が正確に反映されており、古地図と比較する際の基準（ベースマップ）となります。"
};

// 重ねる古地図のリスト
// `addedAt: "YYYY-MM-DD"` を付けると、追加から 7 日間 UI に NEW が表示されます。
export const overlays = [
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
        attribution: "この地図は1800年に原田茂嘉によって写されたものです。原田氏の分析によれば、1660年頃（江戸時代初期）の岡山の姿を伝えています。一部、道や名前に書き間違いの可能性があるとされていますが、当時の貴重な資料を忠実に再現したものです",
        defaultOpacity: 0.5,
        zIndex: 50,
        addedAt: "2026-03-01"
    },
    {
        id: "1880_meiji",
        name: "明治期の海岸線",
        year: 1880,
        url: "https://cyberjapandata.gsi.go.jp/xyz/swale/{z}/{x}/{y}.png",
        attribution: "明治13年（1880年）〜明治45年（1912年）にかけて測量された「迅速測図」などの古い地形図を基に、当時の湿地、葦原、水域などを可視化したデータです。 昭和以降の大規模な埋め立てが行われる前の「自然に近い海岸線」や、標高が低く水が溜まりやすかった場所を知る手がかりとなります。",
        defaultOpacity: 0.5,
        zIndex: 50,
        addedAt: "2026-03-01"
    },
    {
        id: "1897_meiji",
        name: "明治30年の地図",
        year: 1897,
        url: "https://mapwarper.h-gis.jp/maps/tile/711/{z}/{x}/{y}.png",
        attribution: "明治30年〜陸軍参謀本部により測図された地図。現在の30号線沿いまで陸地が拡大している。スタンフォード大学のデータベースに掲載されている。",
        defaultOpacity: 0.5,
        zIndex: 50,
        addedAt: "2026-03-08"
    },
    // {
    //     id: "1925_shomitsu",
    //     name: "大正14年の地図",
    //     year: 1925,
    //     url: "https://mapwarper.h-gis.jp/maps/tile/5789/{z}/{x}/{y}.png",
    //     attribution: "最新詳密金刺分縣地圖。第6版のため初出は大正14年より古い可能性がある。海岸線が明治30年より後退している部分があるのはそのためか",
    //     defaultOpacity: 0.5,
    //     zIndex: 50
    // },
    {
        id: "1945_aerial_v2",
        name: "航空写真 (広域版)",
        year: 1945,
        url: "https://cyberjapandata.gsi.go.jp/xyz/ort_USA10/{z}/{x}/{y}.png", 
        attribution: "国土地理院",
        description: "戦後直後の米軍撮影による航空写真です。1945〜50年当時の岡山の姿を詳細に映し出します。",
        defaultOpacity: 0.8,
        zIndex: 150,
        maxNativeZoom: 17,
        maxZoom: 20,
        addedAt: "2026-03-08"
    },
    {
        id: "1974_picture",
        name: "航空写真",
        year: 1974,
        url: "https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg",
        description: "国土地理院┃高度経済成長期の岡山。児島湾の締切堤防が完成し、現在の南区の形がほぼ定まった時期の姿です。",
        defaultOpacity: 0.8,
        zIndex: 140,
        addedAt: "2026-03-01"
    },


    // ここに新しいMapWarperのデータを追加していくだけで、UIに自動反映されます
];