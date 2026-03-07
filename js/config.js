// ベースマップの設定
export const baseMap = {
    id: "modern",
    name: "現代 (地理院地図)",
    url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    attribution: "地理院地図┃現在の日本の標準的な地図です。最新の道路、建物、地形が正確に反映されており、古地図と比較する際の基準（ベースマップ）となります。"
};

// 重ねる古地図のリスト
export const overlays = [
    {
        id: "chisui_bunruizu",
        name: "戦国〜平安推定マップ (吉備の穴海)",
        year: "∞",
        url: "https://cyberjapandata.gsi.go.jp/xyz/lcm25k_2012/{z}/{x}/{y}.png",
        description: "国土地理院 (治水地形分類図)。江戸時代以前の岡山を推測するモード。紫色のエリアをすべて『海』、水色の筋を『川』と見なすと、児島が島だった頃の『吉備の穴海』の姿が見えてきます。",
        defaultOpacity: 0.8,
        zIndex: 140
    },
    {
        id: "1660_ikeda",
        name: "岡山城周辺地図(池田家岡山古図)",
        year: 1660,
        url: "https://mapwarper.h-gis.jp/maps/tile/5139/{z}/{x}/{y}.png",
        attribution: "この地図は1800年に原田茂嘉によって写されたものです。原田氏の分析によれば、1660年頃（江戸時代初期）の岡山の姿を伝えています。一部、道や名前に書き間違いの可能性があるとされていますが、当時の貴重な資料を忠実に再現したものです",
        defaultOpacity: 0.5,
        zIndex: 50
    },
    {
        id: "1880_meiji",
        name: "明治期の海岸線",
        year: 1880,
        url: "https://cyberjapandata.gsi.go.jp/xyz/swale/{z}/{x}/{y}.png",
        attribution: "明治13年（1880年）〜明治45年（1912年）にかけて測量された「迅速測図」などの古い地形図を基に、当時の湿地、葦原、水域などを可視化したデータです。 昭和以降の大規模な埋め立てが行われる前の「自然に近い海岸線」や、標高が低く水が溜まりやすかった場所を知る手がかりとなります。",
        defaultOpacity: 0.5,
        zIndex: 50
    },
    {
        id: "1897_meiji",
        name: "明治30年の地図",
        year: 1897,
        url: "https://mapwarper.h-gis.jp/maps/tile/711/{z}/{x}/{y}.png",
        attribution: "明治30年〜陸軍参謀本部により測図された地図。現在の30号線沿いまで陸地が拡大している。スタンフォード大学のデータベースに掲載されている。",
        defaultOpacity: 0.5,
        zIndex: 50
    },
    {
        id: "1974_picture",
        name: "航空写真",
        year: 1974,
        url: "https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg",
        description: "国土地理院┃高度経済成長期の岡山。児島湾の締切堤防が完成し、現在の南区の形がほぼ定まった時期の姿です。",
        defaultOpacity: 0.8,
        zIndex: 140
    },


    // ここに新しいMapWarperのデータを追加していくだけで、UIに自動反映されます
];