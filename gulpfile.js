const {
  src,
  dest,
  series,
  parallel,
  watch
} = require('gulp')
const loadPlugins = require('gulp-load-plugins')
const del = require('del')
const browserSync = require('browser-sync')
const plugins = loadPlugins()
const bs = browserSync.create()

const data = {
  menus: [],
  pkg: require('./package.json'),
  date: new Date()
}

const clean = () => {
  return del(['dist', 'temp'])
}

const style = () => {
  return src('src/assets/styles/*.scss', {
      base: 'src'
    })
    .pipe(plugins.sass({
      outputStyle: 'expanded'
    }))
    .pipe(dest('temp'))
    // 向浏览器推送流，和bs.files功能一样
    .pipe(bs.reload({
      stream: true
    }))
}

const script = () => {
  return src('src/assets/scripts/*.js', {
      base: 'src'
    })
    .pipe(plugins.babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(dest('temp'))
}

const page = () => {
  return src('src/*.html', {
      base: 'src'
    })
    .pipe(plugins.swig({
      data,
    }))
    .pipe(dest('temp'))
}

const image = () => {
  return src('src/assets/images/**', {
      base: 'src'
    })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', {
      base: 'src'
    })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const extra = () => {
  return src('public/**', {
    base: 'public'
  }).pipe(dest('dist'))
}

const serve = () => {
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/styles/*.js', script)
  watch('src/*.html', page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload)

  bs.init({
    notify: false,
    port: 3001,
    open: true,
    files: 'temp/**',
    server: {
      // 减少静态资源构建
      baseDir: ['temp', 'src', 'public'],
      routes: {
        '/node_modules': 'node_modules/'
      }
    }
  })
}
// 第三方文件合并,压缩代码
const useref = () => {
  return src('temp/*.html', {
      base: 'temp'
    })
    .pipe(plugins.useref({
      searchPath: ['temp', '.']
    }))
    // html,js,css
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest('dist'))
}


const compile = parallel(style, script, page)
const dev = series(compile, serve)
const build = series(clean, parallel(compile, image, font, extra), useref)

module.exports = {
  clean,
  build,
  dev
}
