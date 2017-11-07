var gulp = require('gulp'); //引入最重要的模块,gulp模块
var $ = require('gulp-load-plugins')(); //引入一个方便的模块,但不是必须的；有了这个模块,其他的模块就可以通过$符号来引入,而不需要声明这个变量,这就是它给我们带来的好处
//在引入gulp-load-plugins的时候，需要对其实例化,加()

var open = require('open');

var app = { // 声明一个全局变量,这个全局变量主要是用来定义我们的目录路径
  srcPath: 'src/',   //源代码目录
  devPath: 'build/', //整合之后的文件
  prdPath: 'dist/'   //生产部署目录
};

//之前我们通过bower安装了一些第三方依赖,但是这些依赖需要放到开发目录和生产环境
gulp.task('lib', function() { //首先使用task函数定义一个任务,这个任务名叫做lib,在传入一个回调函数
  //在回调函数内部输入需要执行的任务列表
  gulp.src('bower_components/**/*.js') //读取文件 传入文件路径 **/*表示对上层文件夹下的子文件进行深度遍历
  .pipe(gulp.dest(app.devPath + 'vendor')) //将文件拷贝到开发目录下,给它重新命名为vendor
  .pipe(gulp.dest(app.prdPath + 'vendor')) //将文件拷贝到生产目录下,给它重新命名为vendor
  .pipe($.connect.reload()); //通知服务器刷新,进行实时预览 (仅支持高级浏览器)
});

gulp.task('html', function() { //定义任务名称叫做html 
  gulp.src(app.srcPath + '**/*.html') //读取这个文件下的所有的html文件
  .pipe(gulp.dest(app.devPath)) //将这些文件拷贝到开发目录
  .pipe(gulp.dest(app.prdPath)) //将这些文件拷贝到生产目录
  .pipe($.connect.reload()); //通知服务器刷新,进行实时预览 (仅支持高级浏览器)
})


gulp.task('json', function() { //在没有后端的时候做的虚拟数据,在有后端API的情况下可以不写这个
  gulp.src(app.srcPath + 'data/**/*.json') //读取这个json文件
  .pipe(gulp.dest(app.devPath + 'data')) //将文件拷贝到开发目录的data目录下,给它重新命名为data
  .pipe(gulp.dest(app.prdPath + 'data')) //将文件拷贝到生产目录的data目录下,给它重新命名为data
  .pipe($.connect.reload()); //通知服务器刷新,进行实时预览 (仅支持高级浏览器)
});

gulp.task('less', function() { //定一个任务名叫less
  gulp.src(app.srcPath + 'style/index.less') //用less文件来引入其他的less文件,在编译的时候，只需要编译这一个less文件就行了
  .pipe($.plumber())
  .pipe($.less()) //编译less文件 因为第2行引入的插件 此处无需重新声明,直接用$符引入即可
  .pipe(gulp.dest(app.devPath + 'css')) //编译完成之后放到我们的开发目录下的css文件夹
  .pipe($.cssmin()) //在放入生产环境之前将其压缩一下
  .pipe(gulp.dest(app.prdPath + 'css')) //放到我们的生产目录下的css文件夹
  .pipe($.connect.reload()); //通知服务器刷新,进行实时预览 (仅支持高级浏览器)
});

gulp.task('js', function() { //定一个任务名叫js
  gulp.src(app.srcPath + 'script/**/*.js') //读取script目录下的所有js文件
  .pipe($.plumber())
  .pipe($.concat('index.js')) //我们需要将这些js文件合并,生产一个index.js文件
  .pipe(gulp.dest(app.devPath + 'js')) //合并完成之后将js放到开发目录
  .pipe($.uglify()) //发布到生产环境的时候需要对其进行压缩
  .pipe(gulp.dest(app.prdPath + 'js')) //压缩之后放到生产目录
  .pipe($.connect.reload()); //通知服务器刷新,进行实时预览 (仅支持高级浏览器)
});

gulp.task('image', function() { //定一个任务名叫image
  gulp.src(app.srcPath + 'image/**/*') //读取image目录下的所有文件
  .pipe($.plumber())
  .pipe(gulp.dest(app.devPath + 'image')) //将文件拷贝到开发目录下的image
  .pipe($.imagemin()) //放到生产环境之前，对其进行压缩
  .pipe(gulp.dest(app.prdPath + 'image')) //将压缩之后的文件在放到生产目录下
  .pipe($.connect.reload()); //通知服务器刷新,进行实时预览 (仅支持高级浏览器)
});

//在写完合并、压缩、发布这些任务之后,我们在写一个总任务,起个名字叫build,把它们进行合并起来
gulp.task('build', ['image', 'js', 'less', 'lib', 'html', 'json']); 
//这样在执行整个打包任务的时候,只要执行build任务就行了

gulp.task('clean', function() { //以上配置完成后,基本上我们静态文件就可以合并和压缩以及发布了
  //但是每次发布之前需要对之前发布的内容进行清除,避免就的文件对当前项目造成影响
  // 所以我们要编写一个清除的任务
  gulp.src([app.devPath, app.prdPath]) //读取开发目录和生产目录下的所有文件
  .pipe($.clean()); //清除一下开发目录和生产目录
});

//在开发完一段代码之后,我们启动服务器build一下,这样的任务我们可以编写一个任务让它自动化的执行
gulp.task('serve', ['build'], function() { //写一个任务叫做serve
  $.connect.server({ // 启动一个服务器
    root: [app.devPath], //这个服务器默认从开发目录下进行读取
    livereload: true, //每当写完确认后，自动刷新浏览器 (仅支持高级浏览器,不支持IE)
    port: 3000 //端口设为:3000
  });

  open('http://localhost:3000'); //服务器启动之后自动拉起浏览器打开网址

  //watch的任务是监控文件,这里我们监控原路径的文件
  //这样我们修改源文件的时候,他就会自动修改对应的构建任务
  gulp.watch('bower_components/**/*', ['lib']);
  gulp.watch(app.srcPath + '**/*.html', ['html']);
  gulp.watch(app.srcPath + 'data/**/*.json', ['json']);
  gulp.watch(app.srcPath + 'style/**/*.less', ['less']);
  gulp.watch(app.srcPath + 'script/**/*.js', ['js']);
  gulp.watch(app.srcPath + 'image/**/*', ['image']);
});

gulp.task('default', ['serve']); // 定义gulp的默认任务 这样我直接在命令行执行gulp,它就会直接指向default的任务

/*
思路小结:
1、首先我们需要引入gulp模块
2、编写各个文件的拷贝、合并、压缩、发布任务
3、编写一个叫build的总任务将前面的各个任务合并起来
4、编写清除任务,每次发布任务之前对之前的任务进行清除
5、编写服务器serve任务,让服务器启动之后自动执行build任务
6、编写open,让服务器启动之后,自动拉起浏览器打开对应网址
7、编写监控任务watch,对对应的源文件进行监控
8、编写gulp默认任务,让gulp启动后直接启动serve任务
*/