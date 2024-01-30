# Runich (приложение для бегунов)

## [Функционал](#functional) <a name="functional-back"></a>

## [Название](#naming)

## [История](#history)

## [Цели](#goals)

## [Технологии](#technologies)

## [Почему такие технологии](#why-technologies)

<a name="naming"></a>Производное от run и моего ника sanich123

<a name="history"></a>Изначально я хотел просто попробовать react-native в связке с expo. Так как я увлеченный бегун-любитель, то захотелось в качестве ознакомления сделать приложение, с которым мог бы ежедневно взаимодействовать. За основу было взято приложение Strava (безусловно, мировой лидер в данной сфере - мой низкий поклон).

<a name="goals"></a>Сперва целью было просто попробовать разработку на мобильных устройствах, новые технологии и прочее. Было сложно, но вроде понравилось. Потом ставил целью сделать приложение, которым можно было бы пользоваться. Пользоваться можно, но есть и лучше приложухи, безусловно:). На данный момент целью видится доделывание приложения до production состояния и размещение в Google Play и App Store если уж не для реального пользователя (что конечно сложно), то хотя бы для демонстрации скиллов работодателям.

<a name="technologies"></a>Frontend написан на react-native (expo). State-manager - redux c redux-persist. Билды - eas-cli. Карты - (@rn-mapbox). Авторизация по email через supabase. Backend - Nest.js/Prisma/PostgreSQL, база данных supabase.  

<a name="why-technologies"></a>React-native + expo позволяют писать один код для 3х платформ - android, ios, web. На данный момент проект запускается и на android и на ios, web - только с отключенными импортами карт:(. Если будущие версии expo sdk будут позволять под разные версии писать разные импорты - web тоже будет работать. Карты mapbox, потому что в google надо было привязывать иностранную карточку, а mapbox позволял делать это бесплатно. @rn-mapbox это не самое лучшее решение (очень плохая документация), но переписывать на гугловские карты пока времени и настроения нет. Supabase был выбран потому что это очень хороший open-source аналог Firebase. Так как Firebase не поддерживает postgreSQL базы данных, а для функционала социальной сети довольно удобно использовать реляционную базу данных (с ней я хоть что-то делал по минимуму), то использование supabase показалось довольно обоснованным. Итоговая схема выглядит так: supabase разруливает авторизацию и возвращает объект юзера с присвоенным ему id, а через nest.js и prisma потом к этому id привязываются новые сущности, которые нужны для реализации приложения. Пока это работает довольно успешно. Из минусов деплоил сервер и на render.com (работает с мобильного только через VPN), и на railway.com (на данный момент задеплоен именно там). В итоге на railway нельзя выбрать регион расположения сервера, и запрос уходит на сервер в Штатах, дальше оттуда сервер коннектит базу данных где-то в Европе, после этого база данных передает обратно серверу какие-то данные в Штаты, которые он обратно передает в Россию. Работает это как-то так, надо что-то переделать, но отечественных таких сервисов не нашел

## [Functional](#functional-back)
<a id="functional"></a>

1. Регистрация, авторизация через email. Токен сохраняется в SecureStore между сессиями. При перезагрузке приложения, если авторизационный токен не просрочен - нет необходимости вводить заново email.
![Регистрация](https://github.com/sanich123/Running-app/assets/70276651/79f66951-b083-499e-8c34-d2e970985aef)



2. Профиль. Пользователь может сохранять и изменять информацию о себе в личном кабинете - фотография, фамилия, имя, пару слов о себе. Так же в профиле находятся цифры отслеживающих Вас или отслеживаемых Вами пользователей. (Followers). Вверху на странице отображаются все фотографии пользователя, которые он загружал в сохраненные тренировки. Клик по фотографиям ведет на страницу со списком фотографий. Клик по количеству фолловеров ведет на страницу со списком фолловеров
![Profile full info](https://github.com/sanich123/Running-app/assets/70276651/07750c1b-41fb-4d9c-8109-9e9c40945c49)
![Following users](https://github.com/sanich123/Running-app/assets/70276651/cbd06e0f-0334-481f-a6f6-ede30576bb5c)


3. Домашняя страница. Отслеженные тренировки пользователя и тех, на кого подписан пользователь загружаются с сервера. Карточка тренировки состоит из элементов: фотография, имя, фамилия пользователя, дата, время, заголовок (если есть), изображение карты с треком тренировки, количество лайкнувших (с аватаами), количество прокомментировавших (если есть), кнопки - лайк, коммент и share. Если к тренировке были сохранены отдельные фотографии, они будут доступны при свайпе вправо с изображения карты. При клике по карте или изображению происходит переход на страницу карты или изображения. Клик фотографии, ФИО ведет на страницу профиля пользователя. Клик по области заголовка на страницу расширенной информации о тренировке. Клик по кнопке коммента ведет на страницу, где можно оставить комментарий. Клик по аватарам лайкнувших ведет на страницу, где можно посмотреть профили лайкнувших. Комментарии - на страницу с комментариями. Лайк позволяет лайкнуть, а кнопка share выводит системное окно, в котором можно выбрать мессенджер, в котором отправить изображение тренировки. На странице есть кнопка ручного добавления тренировки, которая открывает модальное окно. В случае, если есть несинхронизированные с сервером тренировки (по причине отсутствия связи), сверху страницы будет индикатор несинхронизированных тренировок с возможностью отправки вручную или автоматически. При отсутствии соединения с сетью вверху страницы будет индикатор досутпности сети.
![Main functional of the card](https://github.com/sanich123/Running-app/assets/70276651/0f75dd29-7110-45f8-9de9-f4461d2e3b56)
![Follow-unfollow](https://github.com/sanich123/Running-app/assets/70276651/8e136e2b-7096-4aed-8917-6edfbfb67cb0)


5. Расширенная страница тренировки. Помимо базовой информации на странице будут также представлены расширенные данные - набор высоты, разбивка времени по километрам и набор высоты по километрам. Если вы просматриваете свою тренировку, рядом с кнопкой share будет кнопка удалить, которая позволяет удалить тренировку с сервера.

6. Страница карты. Карта mapbox с нарисованным на ней треком (линией через все точки) и километровыми отметками.

7. Страница комментария. Вверху уменьшенное изображение карты. Снизу отображаются комментарии к тренировке. После отправки комментария он через какое-то время отрисуется на этой странице. Комментарии можно лайкать. Комментарии, лайкнутые пользователем добавляют красное сердечко и надпись "Вы лайкнули", если этот комментарий лайкнули кроме пользователя другие пользователи надпись будет "Вы и (количество пользователей) лайкнули".

8.
