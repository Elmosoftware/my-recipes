var fs = require("fs");
var gulp = require("gulp");
var del = require("del");
var babel = require("gulp-babel");
var uglify = require("gulp-uglify");
var nodemon = require("gulp-nodemon");
var rename = require("gulp-rename")

var path = {
    // src: `*.js`,
    srcAppFiles: [`*.js`, `!gulpfile.js`],
    srcAdditionalFiles: [`*.html`],
    stage: `tmp`,
    prod: `dist`,
    configFiles: {
        stage: `.env`,
        prod: `.prod.env`,
        prodDeploy: [`package.json`, `package-lock.json`, `now.json`]
    }
}

//#region Deploy to TMP folder
gulp.task("cleanTemp", function () {
    console.log(`Removing folder ${path.stage} ...`);
    return del([path.stage]);
});

gulp.task("copyRootFilesToTemp", function () {
    console.log(`Copying files. Src: ${path.srcAppFiles.join(", ")} , to target: ${path.stage} ...`);
    return gulp.src(path.srcAppFiles)
        .pipe(gulp.dest(path.stage));
});

gulp.task("copyAdditionalFilesToTemp", function () {
    console.log(`Copying files. Src: ${path.srcAdditionalFiles.join(", ")} , to target: ${path.stage} ...`);
    return gulp.src(path.srcAdditionalFiles)
        .pipe(gulp.dest(path.stage));
});

gulp.task("copyConfigToTemp", function () {
    console.log(`Copying config file to ${path.stage} ...`);
    return gulp.src(path.configFiles.stage)
        .pipe(gulp.dest(path.stage));
});

//Summarizing task:
gulp.task("copyToTemp", gulp.series(
    "cleanTemp",
    "copyRootFilesToTemp",
    "copyAdditionalFilesToTemp", 
    "copyConfigToTemp"
));

gulp.task("runAPIfromTemp", function (done) {
    nodemon({
        script: `${path.stage}/index.js`,
        env: { 
            "NODE_ENV": "development" 
        },
        done: done
    })
})
//#endregion

//#region Deploy to DIST folder
gulp.task("cleanDist", function () {
    console.log(`Removing folder ${path.prod} ...`);
    return del([path.prod]);
});

gulp.task("copyRootFilesToDist", function () {
    console.log(`Copying files. Src: ${path.srcAppFiles.join(", ")} , to target: ${path.prod} ...`);
    return gulp.src(path.srcAppFiles)
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest(path.prod))
});

gulp.task("copyAdditionalFilesToDist", function () {
    console.log(`Copying files. Src: ${path.srcAdditionalFiles.join(", ")} , to target: ${path.prod} ...`);
    return gulp.src(path.srcAdditionalFiles)
        .pipe(gulp.dest(path.prod))
});

gulp.task("copyConfigToDist", function () {
    console.log(`Copying config file to ${path.prod} ...`);
    return gulp.src(path.configFiles.prod)
        .pipe(rename("/" + path.configFiles.stage)) //Renaming the PROD ENV file as .env.
        .pipe(gulp.dest(path.prod));
});

gulp.task("copyDeployConfigToDist", function () {
    console.log(`Copying deployment configuration files to ${path.prod} ...`);
    return gulp.src(path.configFiles.prodDeploy)
        .pipe(gulp.dest(path.prod));
});

//Summarizing task:
gulp.task("copyToDist", gulp.series(
    "cleanDist",
    "copyRootFilesToDist",
    "copyAdditionalFilesToDist", 
    "copyConfigToDist",
    "copyDeployConfigToDist"
));

gulp.task("runAPIfromDist", function (done) {

    //Adding this because, if we run this task before the build, NodeMon will keep trying to load the server forever:    
    if (!fs.existsSync("./" + path.prod)) {
        throw `The "${path.prod}" folder doesn't exists. Be sure to run the "Build to Prod" task before.`
    }

    nodemon({
        script: `${path.prod}/index.js`,
        env: { 
            "NODE_ENV": "production",
            "PORT" : 3000
        },
        done: done
    })
})
//#endregion

//Followin summary tasks will be added in "tasks.json" file: 
gulp.task("BuildToStageAndRun", gulp.series(
    "copyToTemp",
    "runAPIfromTemp"
));

gulp.task("BuildToProd", gulp.series(
    "copyToDist"
));

gulp.task("RunProdBuild", gulp.series(
    "runAPIfromDist"
));

