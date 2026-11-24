import json, csv, hashlib, sys
P = [[3089,"2025-04-28","using-signalr-ioptionsmonitor-with-umbraco-bellissima-for-reactive-net-options"],[3046,"2025-04-09","quick-tip-how-to-prevent-html-in-umbraco-form-fields"],[2812,"2025-01-16","how-to-refresh-the-umbraco-v14-bellissima-content-tree-with-code"],[2364,"2024-07-12","how-to-overwrite-the-save-publish-button-and-more-in-umbraco-v14"],[2335,"2024-07-10","why-i-have-still-stuck-around-in-the-umbraco-community-after-all-these-years"],[2293,"2024-06-10","automate-umbraco-project-setup-using-github-template-repositories-and-actions"],[2264,"2024-06-03","scaffold-umbraco-v14-package-development-project-with-vite-typescript-lit"],[2238,"2024-05-28","how-to-disable-the-umbraco-v14-getting-started-dashboard"],[2207,"2024-05-21","how-to-create-an-umbraco-v14-belissima-svg-icon-pack-with-node-js"],[2119,"2024-04-09","creating-a-custom-condition-for-umbraco-bellissima-aka-v14"],[2084,"2024-03-18","my-first-umbraco-bellissima-package"],[2053,"2024-03-06","umbraco-community-runtime-validators"],[2011,"2024-01-04","quick-tip-adding-a-saved-search-to-logviewer-in-umbraco-with-code"],[1948,"2023-11-20","quick-tip-how-to-customise-your-umbraco-13-login-screen"],[1927,"2023-11-01","adding-a-custom-webhook-type-to-umbraco-v13"],[1876,"2023-10-31","how-i-learnt-a-new-programming-language-over-hacktoberfest-by-creating-an-umbraco-segment-for-oh-my-posh"],[1534,"2023-01-03","resolving-the-swagger-conflict-for-swashbuckle-and-nswag-in-umbraco-forms-10-2"],[1215,"2021-09-09","using-netcore-identity-ipasswordvalidator-with-umbraco-cms"],[1192,"2021-09-07","how-to-run-netcore-umbraco-cms-on-a-macbook"],[1085,"2021-01-08","how-to-use-github-sponsors-to-help-monetize-your-software"],[949,"2018-07-30","peek-inside-umbraco-v8-nucache-files-with-the-nucache-explorer-tool"],[914,"2018-07-03","umbraco-v8-swapping-log4net-for-serilog-with-this-switcheroo-magic-trick"],[892,"2018-06-15","umbraco-v8-bye-bye-applicationeventhandler-hello-umbraco-components"],[881,"2018-06-08","i-attended-the-umbraco-examine-course-you-wont-believe-what-happened-next"],[770,"2017-05-10","iis-express-for-vs-code"],[600,"2017-04-24","why-did-the-umbraco-pet-project-uhangout-die"],[565,"2015-11-17","time-to-say-goodbye-for-now"],[544,"2015-07-22","how-to-use-visual-studio-android-emulator-on-vmware-fusion"],[531,"2015-06-17","thank-you-umbraco-community"],[486,"2015-01-06","securing-umbraco-web-apis-using-json-web-tokens"],[466,"2014-10-12","my-development-setup-whats-yours"],[458,"2014-09-17","quick-snippet-toggle-tree-navigation-in-umbraco-backoffice-using-javascript"],[445,"2014-08-08","using-umbraco-contour-form-builder-with-slack-chat"],[422,"2014-07-01","we-are-umbraco-craftsmen"],[405,"2014-06-23","what-on-earth-is-umbraco-servervariables-parsing"],[394,"2014-06-18","thanks"],[381,"2014-04-17","umbraco-mvc-regionalisation-of-error-messages"],[365,"2014-03-24","yo-umbraco"],[330,"2014-02-19","using-teamcity-for-continuous-integration-with-nodejs-and-grunt"],[303,"2013-12-31","2013-my-umbraco-year-in-review"],[295,"2013-12-12","umbraco-7-creating-a-generic-settings-editor-with-webapi-angularjs"],[289,"2013-12-10","quick-tip-add-a-new-custom-section-to-umbraco-7"],[276,"2013-12-03","using-umbraco-pipeline-for-member-profile-urls"],[270,"2013-12-01","quick-tip-adding-custom-doctype-icons-to-umbraco-7"],[260,"2013-10-14","visual-studio-extensions-for-umbraco"],[246,"2013-09-23","restrict-umbraco-media-filesize-with-js"],[239,"2013-09-13","umbraco-community-google-hangouts"],[230,"2013-09-13","teacommerce-certified-developer"],[228,"2013-08-30","the-wonderful-assistant"],[215,"2013-08-23","how-i-built-my-first-property-editor-for-umbraco-belle"],[201,"2013-08-20","diagnostics-for-umbraco"],[197,"2013-08-07","the-new-way-to-do-a-404-umbraco-handler"],[189,"2013-08-01","how-to-compile-sass-less-coffeescript-on-your-build-server-with-teamcity"],[183,"2013-07-26","how-i-added-a-custom-umbraco-member-type-for-cws-reboot-programmatically"],[163,"2013-07-24","dont-make-the-same-mistake-as-i-did-when-creating-a-custom-umbraco-macro-parameter-type"],[134,"2013-07-22","umbraco-mvc-what-on-earth-is-a-surface-controller"],[115,"2013-07-17","umbraco-mvc-is-the-macro-as-useful-in-v6-with-partials"],[99,"2013-07-17","umbraco-mvc-first-steps"],[69,"2013-07-16","umbraco-petapoco-to-store-blog-comments"],[62,"2013-07-16","why-i-think-your-doing-it-wrong-umbraco-alttemplate-data-views"],[26,"2013-07-15","umbraco-extension-methods-community-project"],[24,"2013-07-15","highlight-errors-in-codemirror"],[20,"2013-07-12","transformers-robots-in-disguise"],[10,"2013-07-12","its-good-to-be-back"]]
T = ["netcore","netcoreidentity","2013","alttemplates","analytics","android-emulator","angular","angularjs","authorisation","azure","belle","bellissima","blog-series","bower","cg14","cg15","code","code-snippet","codegarden","codegarden-14","codegarden-15","codegarden-18","codegarden14","codemirror","codespaces","coffeescript","collaboration","command-line","community","compass","computer-setups","continuous-integration","contour","contour-form-builder","contour-workflow","contribution","css","custom-macro-parameter","cws-reboot","database","development-setups","diagnostics","e-commerce","examine","extension","git","github","github-actions","github-automation","github-sponsors","go","google-hangout","google","graphql","grunt","gruntjs","hacktoberfest","health","html","icons","icontentfinder","iis-express","javascript","javascript-snippet","jon-humphrey","json-web-tokens","jwt","less","lifetime-mvp","log4net","logging","logviewer","lucene","mental-health","mvc","mvc-validation","mvp","net","new-job","node","node-js","nodejs","npm","nucache","oh-my-posh","opinion","optimus","package","personal","petapoco","php-iis-express","powershell","powershell-snippet","presentation","programming","property-editor","property-editors","psychosis","public-profiles","regionalisation","request-pipeline","ruby","sass","scaffolding","seq","serilog","signalr","slack","slack-chat","slackhq","snippet","sponsorware","structured-logging","surfacecontroller","swagger","swashbuckle","talk","teacommerce","teamcity","the-cogworks","training","tutorial","typescript","uhangout","umbraco","umbraco-14","umbraco-15","umbraco-7","umbraco-8","umbraco-9","umbraco-bellissima","umbraco-community","umbraco-community-google-hangout","umbraco-contour","umbraco-course","umbraco-diagnostics","umbraco-e-commerce","umbraco-extension-methods","umbraco-forms","umbraco-mvc","umbraco-mvc-series","umbraco-mvc-validation","umbraco-mvp","umbraco-package","umbraco-regionalisation-errors","umbraco-tutorial","umbraco-webcomponents","umbraco-v14","umbraco6","validation","virutal-machines","visual-studio","visual-studio-android-emulator","visual-studio-extension","vms","vmware-fusion","vs-code","vs-code-extension","vs2015","vscode","web-api","web-api-token-authorisation","web-development","webapi","webcomponents","webhooks","work","year-review","yeoman"]

# 11 topic tags on the new site; every old tag folds into one
TOPICS = {
 "umbraco": "umbraco umbraco-7 umbraco-8 umbraco-9 umbraco6 umbraco-mvc umbraco-mvc-validation umbraco-regionalisation-errors mvc alttemplates surfacecontroller custom-macro-parameter icontentfinder request-pipeline public-profiles regionalisation examine lucene icons webhooks analytics",
 "bellissima": "bellissima umbraco-bellissima umbraco-14 umbraco-15 umbraco-v14 umbraco-webcomponents webcomponents",
 "umbraco-packages": "umbraco-package package umbraco-extension-methods cws-reboot contribution umbraco-diagnostics diagnostics nucache optimus",
 "umbraco-forms": "umbraco-forms contour contour-form-builder contour-workflow umbraco-contour slack slack-chat slackhq",
 "dotnet": "net netcore netcoreidentity web-api webapi web-api-token-authorisation jwt json-web-tokens authorisation swagger swashbuckle signalr petapoco database validation mvc-validation",
 "javascript": "javascript javascript-snippet angular angularjs belle typescript node node-js nodejs npm grunt gruntjs bower yeoman scaffolding coffeescript sass less compass css html codemirror property-editor property-editors",
 "logging": "logging serilog log4net seq structured-logging logviewer",
 "tooling": "vs-code vscode vs-code-extension iis-express php-iis-express visual-studio visual-studio-extension visual-studio-android-emulator android-emulator vs2015 teamcity continuous-integration git github github-actions github-automation github-sponsors sponsorware powershell powershell-snippet command-line oh-my-posh go codespaces vmware-fusion vms virutal-machines development-setups computer-setups extension ruby azure graphql hacktoberfest",
 "community": "community umbraco-community codegarden codegarden-14 codegarden-15 codegarden-18 codegarden14 cg14 cg15 mvp umbraco-mvp lifetime-mvp uhangout google-hangout google umbraco-community-google-hangout jon-humphrey talk presentation collaboration training umbraco-course teacommerce e-commerce umbraco-e-commerce",
 "personal": "personal health mental-health psychosis new-job work the-cogworks opinion year-review 2013",
 "tutorials": "tutorial umbraco-tutorial code-snippet snippet code programming blog-series web-development umbraco-mvc-series",
}
tag_topic = {}
for topic, words in TOPICS.items():
    for w in words.split():
        assert w not in tag_topic, f"duplicate {w}"
        tag_topic[w] = topic
missing = [t for t in T if t not in tag_topic]; extra = [t for t in tag_topic if t not in T]
assert not missing, f"unmapped tags: {missing}"
assert not extra, f"mapped tags that don't exist: {extra}"

OLD, NEW = "https://blog.hackmakedo.com", "https://hackmakedo.com"
rows = []
add = lambda o, n, kind, wpid="", note="": rows.append([o, n, kind, wpid, note])
add(f"{OLD}/", f"{NEW}/blog/", "home")
for pid, d, slug in P:
    y, m, dd = d.split("-")
    new = f"{NEW}/blog/{slug}/"
    add(f"{OLD}/{y}/{m}/{dd}/{slug}/", new, "post", pid)
    add(f"{OLD}/?p={pid}", new, "shortlink", pid)
months = sorted({d[:7] for _, d, _ in P}, reverse=True)
for ym in months:
    y, m = ym.split("-"); add(f"{OLD}/{y}/{m}/", f"{NEW}/blog/", "date-archive")
for y in sorted({d[:4] for _, d, _ in P}, reverse=True):
    add(f"{OLD}/{y}/", f"{NEW}/blog/", "date-archive")
for n in range(2, (len(P) + 9) // 10 + 1):
    add(f"{OLD}/page/{n}/", f"{NEW}/blog/page/{n}/", "paged-index", "", "new index pages may count differently; any /blog/page/N/ beyond the last should 301 to /blog/")
for slug, topic in (("personal", "personal"), ("tech", None), ("umbraco", "umbraco")):
    add(f"{OLD}/category/{slug}/", f"{NEW}/blog/tag/{topic}/" if topic else f"{NEW}/blog/", "category")
for t in T:
    add(f"{OLD}/tag/{t}/", f"{NEW}/blog/tag/{tag_topic[t]}/", "tag", "", f"folds into topic '{tag_topic[t]}'")
add(f"{OLD}/feed/", f"{NEW}/blog/rss.xml", "feed")
add(f"{OLD}/comments/feed/", f"{NEW}/blog/rss.xml", "feed")
add(f"{OLD}/?page_id=1064", f"{NEW}/contact/", "page-shortlink", 1064, "linked from the old menu; no published page exists")

out = sys.argv[1]
with open(out, "w", newline="") as f:
    w = csv.writer(f); w.writerow(["old_url", "new_url", "type", "wp_id", "notes"]); w.writerows(rows)
print("rows", len(rows))
from collections import Counter
print(Counter(r[2] for r in rows))
print("topics", Counter(tag_topic.values()))
print("posts_sha", hashlib.sha256(json.dumps(P, separators=(",", ":")).encode()).hexdigest())
print("tags_sha", hashlib.sha256("|".join(T).encode()).hexdigest())
