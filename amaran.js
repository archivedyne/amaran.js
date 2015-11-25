/*
 *
 *  Amaran
 *
 */

function rand_int(range) {
  if (range < 1) {
    return 0;
  }
  return Math.floor(Math.random() * range);
}

function node_random() {

  var types = [
    'bestsellers', //ベストセラー
    'new-releases', //新着ニューリリース
    'movers-and-shakers', //ヒット商品
    'most-gifted', //一番ほしい物リストに追加されている商品
    'most-wished-for' //一番ギフトとして贈られている商品
  ];

  var categories = [
    'diy', //工具
    'dvd', //dvd
    'toys', //おもちゃ
    'automotive', //カー＆バイク用品
    'videogames', //TVゲーム
    'beauty', //コスメ
    'shoes', //シューズ＆バッグ
    'sports', //スポーツ&アウトドア
    'software', //ソフトウェア
    'hpc', //ヘルス&ビューティー
    'baby', //ベビー&マタニティ
    'kitchen', //ホーム&キッチン
    'electronics', //家電・カメラ
    'office-products', //文房具・オフィス用品
    'watch', //腕時計
    'apparel', //服＆ファッション小物
    'books', //本
    'musical-instruments', //楽器
    'english-books', //洋書
    'music', //音楽
    'food-beverage' //食品&飲料
  ];

  return types[rand_int(types.length -1)] + '/' + categories[rand_int(categories.length -1)];
}

/**
 * アマゾンのRankingを生成する
 * @param {string} p_id - HTMLで読み込む要素のID
 * @param {string} a_id - アマゾンのアソシエイトID
 * @param {string} n_id - アマゾンの読み込むノード(type+category)の名前(rand指定でランダム)
 * @param {string} i_id - ノードの表示件数(最大10件)
 *
 */
function amaran(p_id, a_id, n_id, i_id) {

  if (!p_id || !a_id || !n_id || !i_id)	 {
    return;
  }

  if (n_id == 'rand') {
    n_id = node_random();
  }

  //格納変数
  var htmlstr;

  //Google AJAX Feed APIの読み込み
  google.load("feeds", "1");

  function initialize() {

    //feedの取得
    var feed_url = "http://www.amazon.co.jp/gp/rss/" + n_id + "/ref=zg_bs_2278488051_rsslink&tag=sample-31";
    var feed = new google.feeds.Feed(feed_url);
    feed.setNumEntries(i_id);
    feed.load(dispfeed);

    function dispfeed(result) {
      if (result.error) return;

      var channel = []; //ページ用の変数
      var entry = [] //エントリー用の変数
      channel = {
        'title' : result.feed.title,
        'link' : result.feed.link,
        'description' : result.feed.description,
        'author' : result.feed.author
      };

      //タイトル情報の置換(amazonロゴの除去))
      channel['title'] = channel['title'].replace(/Amazon.co.jp: /, "");
      //ページ(カテゴリー)のタイトル
      htmlstr = '<h2 class="category_title">' + channel['title'] + '</h2>';

      //Resultから記事の情報を配列に格納
      for (var i=0; i < result.feed.entries.length; i++) {
        //リスト情報をオブジェクトに格納
        entry[i] = {
          title : result.feed.entries[i].title,
          link : result.feed.entries[i].link,
          content : result.feed.entries[i].content,
          contentSnippet : result.feed.entries[i].contentSnippet,
          publishedDate : result.feed.entries[i].publishedDate
        };
        //title情報の置換(ランキング順位の除去)
        entry[i]['title'] = entry[i]['title'].slice(4);
        //linkにアソシエイトIDを付加
        entry[i]['link'] = entry[i]['link'] + "&tag=" + a_id;
        //img情報のURL抽出
        entry[i]['img'] = result.feed.entries[i].content.match(/src=\"(.*?)\"/igm);
        //img情報に添字付加(0は商品画像、1は評価画像)
        for (var j=0; j<entry[i]['img'].length; j++){
          entry[i]['img'][j] = entry[i]['img'][j].replace(/src=/ig, "");
          entry[i]['img'][j] = entry[i]['img'][j].replace(/\"/ig, "");
        }
        //img画像がない場合は別画像に入れ替え
        if (entry[i]['img'][0].indexOf("g-ecx") !== -1) {
          entry[i]['img'][0] = "http://g-ec2.images-amazon.com/images/G/09/nav2/dp/no-image-no-ciu._V156249166_AA300_.gif";
        }
        // 記事をHTMLに整形
        htmlstr += '<div class="item">';
        htmlstr += '<a href="'+ entry[i]['link'] + '" ' + 'target="_blank"' + '">';
        htmlstr += '<img class="item_img" src="' + entry[i]['img'][0] + '" title="'+ entry[i]['title'] +'">';
        htmlstr += '</a>\n';
        htmlstr += '<h3 class="item_title">\n';
        htmlstr += '<b class="item_ranking">' + (i+1) + '位' + '</b>\n';
        htmlstr += '<a href="'+ entry[i]['link'] + '" ' + 'target="_blank"' + '">' + entry[i]['title'] + '</a>\n';
        htmlstr += '</h3>\n';
        htmlstr += '</div>';
      }

      //htmlstrの出力
      var container = document.getElementById(p_id);
      container.innerHTML += htmlstr;
    }
  }
  google.setOnLoadCallback(initialize);
}
