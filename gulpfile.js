// Импорт необходимых модулей из библиотеки Gulp и других плагинов
const { src, dest, series, watch } = require('gulp');
const autoprefixer = require('gulp-autoprefixer'); // Автопрефиксер для CSS
const babel = require('gulp-babel'); // Транспиляция JavaScript с использованием Babel
const cleanCSS = require('gulp-clean-css'); // Минификация CSS
const uglify = require('gulp-uglify-es').default; // Минификация JavaScript
const del = require('del'); // Удаление файлов и папок
const browserSync = require('browser-sync').create(); // Локальный сервер и автоматическое обновление
const svgSprite = require('gulp-svg-sprite'); // Создание спрайтов из SVG
const sourcemaps = require('gulp-sourcemaps'); // Генерация карт исходных файлов
const htmlmin = require('gulp-htmlmin'); // Минификация HTML
const notify = require('gulp-notify'); // Оповещения об ошибках
const concat = require('gulp-concat'); // Объединение файлов
const path = require('path'); // Работа с путями файлов

let image; // Переменная для модуля обработки изображений

// Асинхронная функция для загрузки модуля обработки изображений
const loadImageModule = async () => {
  image = (await import('gulp-image')).default;
};

// Задача для очистки папки 'dist' перед новой сборкой
const clean = () => {
  return del(['dist/*']);
};

// Задача для создания SVG спрайтов из всех SVG-файлов в папке 'src/img/svg'
const svgSprites = () => {
  return src('./src/img/svg/**.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg', // Имя создаваемого спрайта
          },
        },
      })
    )
    .pipe(dest('./dist/img')); // Вывод спрайтов в папку 'dist/img'
};

// Задача для обработки CSS файлов: добавление префиксов, минификация, объединение
const styles = () => {
  return src('./src/css/**/*.css') // Обработка всех CSS-файлов в папке src/css
    .pipe(sourcemaps.init()) // Инициализация карт исходных файлов
    .pipe(
      autoprefixer({
        cascade: false, // Отключение каскада в префиксах
      })
    )
    .pipe(cleanCSS({ level: 2 })) // Минификация CSS с уровнем сжатия 2
    .pipe(concat('style.css')) // Объединение всех стилей в один файл
    .pipe(sourcemaps.write('.')) // Генерация карт исходных файлов
    .pipe(dest('./dist/css/')) // Вывод стилей в папку dist/css
    .pipe(browserSync.stream()); // Автоматическое обновление браузера
};

// Задача для обработки JavaScript файлов: транспиляция, минификация, объединение
const scripts = () => {
  return src(['./src/js/components/**.js', './src/js/main.js'], { allowEmpty: true }) // Обработка всех JS-файлов
    .pipe(sourcemaps.init()) // Инициализация карт исходных файлов
    .pipe(
      babel({
        presets: ['@babel/env'], // Использование пресета Babel для современных JavaScript
      })
    )
    .pipe(concat('main.js')) // Объединение всех скриптов в один файл
    .pipe(uglify().on('error', notify.onError())) // Минификация с уведомлением об ошибках
    .pipe(sourcemaps.write('.')) // Генерация карт исходных файлов
    .pipe(dest('./dist/js')) // Вывод скриптов в папку dist/js
    .pipe(browserSync.stream()); // Автоматическое обновление браузера
};

// Задача для копирования дополнительных ресурсов (например, шрифты, иконки)
const resources = () => {
  return src('./src/resources/**').pipe(dest('./dist')); // Копирование ресурсов в папку dist
};

// Асинхронная задача для обработки изображений: оптимизация и копирование
const img = async () => {
  await loadImageModule(); // Загрузка модуля обработки изображений
  return src([
    './src/img/**.jpg',
    './src/img/**.png',
    './src/img/**.jpeg',
    './src/img/*.svg',
    './src/img/**/*.jpg',
    './src/img/**/*.png',
    './src/img/**/*.jpeg',
    './src/img/**/*.webp',
  ])
    .pipe(image()) // Оптимизация изображений
    .pipe(dest('./dist/img')); // Вывод изображений в папку dist/img
};

// Задача для наблюдения за изменениями файлов и автоматического выполнения задач
const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: './dist', // Базовая директория для сервера
    },
  });

  watch('./src/css/**/*.css', styles); // Наблюдение за изменениями CSS-файлов
  watch('./src/*.html', htmlMinify); // Наблюдение за изменениями HTML-файлов
  watch('./src/js/**/*.js', scripts); // Наблюдение за изменениями JS-файлов
  watch('./src/resources/**', resources); // Наблюдение за изменениями ресурсов
  watch('./src/img/*.{jpg,jpeg,png,svg,webp}', img); // Наблюдение за изображениями
  watch('./src/img/**/*.{jpg,jpeg,png,webp}', img); // Наблюдение за изменениями в папке с изображениями
  watch('./src/img/svg/**.svg', svgSprites); // Наблюдение за изменениями SVG-файлов
};

// Задача для минификации HTML-файлов
const htmlMinify = () => {
  return src('src/**/*.html')
    .pipe(
      htmlmin({
        collapseWhitespace: true, // Удаление пробелов и переносов строк
      })
    )
    .pipe(dest('dist')) // Вывод минифицированных HTML-файлов в папку dist
    .pipe(browserSync.stream()); // Автоматическое обновление браузера
};

// Экспорт задач Gulp
exports.styles = styles; // Экспорт задачи обработки стилей
exports.htmlMinify = htmlMinify; // Экспорт задачи минификации HTML

// Задача по умолчанию: очистка, сборка скриптов, стилей, ресурсов, изображений, SVG спрайтов, минификация HTML и наблюдение за файлами
exports.default = series(
  clean,       // Очистка директории сборки
  scripts,     // Обработка JavaScript файлов
  styles,      // Обработка CSS файлов
  resources,   // Копирование дополнительных ресурсов
  img,         // Оптимизация изображений
  svgSprites,  // Создание SVG спрайтов
  htmlMinify,  // Минификация HTML файлов
  watchFiles   // Наблюдение за изменениями файлов
);

// Задача для разработки: та же, что и по умолчанию, но не включает минификацию для более быстрого тестирования
exports.dev = series(
  clean,       // Очистка директории сборки
  scripts,     // Обработка JavaScript файлов
  styles,      // Обработка CSS файлов
  resources,   // Копирование дополнительных ресурсов
  svgSprites,  // Создание SVG спрайтов
  watchFiles   // Наблюдение за изменениями файлов
);

// Задача для сборки продакшена: очистка, сборка всех файлов, но без наблюдения за изменениями
exports.build = series(
  clean,       // Очистка директории сборки
  scripts,     // Обработка JavaScript файлов
  styles,      // Обработка CSS файлов
  resources,   // Копирование дополнительных ресурсов
  img,         // Оптимизация изображений
  svgSprites,  // Создание SVG спрайтов
  htmlMinify   // Минификация HTML файлов
);