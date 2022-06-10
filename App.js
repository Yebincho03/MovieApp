import { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Button,
  Image,
  TextInput,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import SelectDropdown from "react-native-select-dropdown";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const API_KEY = "90e04a0098d592fd509e452cf4965b1f";
const Stack = createNativeStackNavigator();

const Tab = createMaterialTopTabNavigator();
const movieType = ["popular", "now playing", "top rated", "upcoming"];

function TabScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Movies" component={MovieScreen} />
      <Tab.Screen name="Search Results" component={SearchScreen} />
      <Tab.Screen name="TV Shows" component={TvScreen} />
    </Tab.Navigator>
  );
}

function createMovieRows(navigation, data, forTv) {
  var movieArr = [];

  for (let i = 0; i < data.length; i++) {
    var title = "";
    var releaseDate = "";
    if (forTv) {
      title = data[i].name;
      releaseDate = data[i].first_air_date;
    } else {
      title = data[i].title;
      releaseDate = data[i].release_date;
    }
    movieArr.push(
      <View style={{ padding: 10, flexDirection: "row" }} key={data[i].id}>
        <Image
          style={styles.movieImg}
          source={{
            uri: "https://image.tmdb.org/t/p/w500" + data[i].poster_path,
          }}
        />

        <View style={{ flexDirection: "column" }}>
          <View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 12 }}>
              Popularity : {data[i].popularity}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 12 }}>Release_date : {releaseDate}</Text>
          </View>
          <View
            style={{
              backgroundColor: "lightblue",
              padding: 5,
              width: 150,
              height: 50,
              fontSize: 12,
              borderRadius: 5,
            }}
          >
            <Button
              title="More Details"
              onPress={() =>
                navigation.navigate("Detail", {
                  movieID: data[i].id,
                  forTv: forTv,
                })
              }
            />
          </View>
        </View>
      </View>
    );
  }
  return movieArr;
}

function MovieScreen({ navigation }) {
  const [movies, setMovies] = useState([]);

  const fetchMovieData = async (sortType) => {
    let urlSearchParam = "";
    switch (sortType) {
      case "popular":
        urlSearchParam = "popular";
        break;
      case "now playing":
        urlSearchParam = "now_playing";
        break;
      case "top rated":
        urlSearchParam = "top_rated";
        break;
      case "upcoming":
        urlSearchParam = "upcoming";
        break;
      default:
    }

    const url = `https://api.themoviedb.org/3/movie/${urlSearchParam}?api_key=${API_KEY}`;
    const api_call = await fetch(url);
    const response = await api_call.json();

    let movieRows = createMovieRows(navigation, response.results, false);
    setMovies(movieRows);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <SelectDropdown
        data={movieType}
        onSelect={(selectedItem, index) => {
          fetchMovieData(selectedItem);
        }}
        buttonTextAfterSelection={(selectedItem, index) => {
          return selectedItem;
        }}
      />
      <ScrollView showsHorizontalScrollIndicator={false}>{movies}</ScrollView>
    </View>
  );
}

function MovieDetail({ route, navigation }) {
  const [detail, setDetail] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMovieDetail = async () => {
    let type = "";
    if (route.params.forTv) {
      type = "tv";
    } else {
      type = "movie";
    }
    const url = `https://api.themoviedb.org/3/${type}/${route.params.movieID}?api_key=${API_KEY}`;
    const api_call = await fetch(url);
    const response = await api_call.json();
    let posterPath = "https://image.tmdb.org/t/p/w500" + response.poster_path;
    let title = "";
    if (route.params.forTv) {
      title = response.name;
    } else {
      title = response.title;
    }
    console.log(url);
    const details = {
      title: title,
      image: posterPath,
      desc: response.overview,
      popularity: response.popularity,
      release_date: response.release_date,
      imgPath: posterPath,
    };

    setDetail(details);
    setLoading(false);
  };

  if (loading) {
    fetchMovieDetail();
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>loading....</Text>
      </View>
    );
  } else {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View>
          <Text style={{ fontWeight: "bold", paddingBottom: 40 }}>
            {detail.title}
          </Text>
        </View>
        <Image
          style={styles.detailImg}
          source={{
            uri: detail.image,
          }}
        />
        <View>
          <Text style={{ padding: 15, marginHorizontal: 10 }}>
            {detail.desc}
          </Text>
        </View>
        <View>
          <Text>Popularity : {detail.popularity}</Text>
        </View>
        <View>
          <Text>Release_date : {detail.release_date}</Text>
        </View>
      </View>
    );
  }
}

function SearchScreen({ navigation }) {
  const [searchResults, setSearchResults] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const searchType = ["movie", "multi", "tv"];
  var selectedSearch = "movie";

  const fetchSearch = async () => {
    const url = `https://api.themoviedb.org/3/search/${selectedSearch}?query=${inputQuery}&api_key=${API_KEY}`;
    const api_call = await fetch(url);
    const response = await api_call.json();

    let rows = createMovieRows(navigation, response.results, false);
    setSearchResults(rows);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View>
        <Text>Search movie/TV show name</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="ex. james bond"
        onChangeText={setInputQuery}
      />
      <View>
        <Text>Choose search type</Text>
      </View>
      <SelectDropdown
        data={searchType}
        onSelect={(selectedItem, index) => {
          selectedSearch = selectedItem;
        }}
        buttonTextAfterSelection={(selectedItem, index) => {
          return selectedItem;
        }}
      />
      <View
        style={{
          backgroundColor: "lightblue",
          padding: 5,
          width: 150,
          height: 50,
          fontSize: 12,
          borderRadius: 5,
        }}
      >
        <Button title="Search" onPress={() => fetchSearch()} />
      </View>
      <ScrollView showsHorizontalScrollIndicator={false}>
        {searchResults}
      </ScrollView>
    </View>
  );
}

function TvScreen({ navigation }) {
  const [tvShows, setTvShows] = useState([]);
  const tvType = ["popular", "on_the_air", "airing_today"];

  const fetchTvData = async (selectedItem) => {
    const url = `https://api.themoviedb.org/3/tv/${selectedItem}?api_key=${API_KEY}`;
    const api_call = await fetch(url);
    const response = await api_call.json();

    let tvRows = createMovieRows(navigation, response.results, true);
    setTvShows(tvRows);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <SelectDropdown
        data={tvType}
        onSelect={(selectedItem, index) => {
          fetchTvData(selectedItem);
        }}
        buttonTextAfterSelection={(selectedItem, index) => {
          return selectedItem;
        }}
      />
      <ScrollView showsHorizontalScrollIndicator={false}>{tvShows}</ScrollView>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tab" component={TabScreen} />
        <Stack.Screen name="Detail" component={MovieDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  detailImg: {
    width: 300,
    height: 300,
  },
  movieImg: {
    margin: 10,
    width: 85,
    height: 85,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    flex: 1,
    flexWrap: "wrap",
  },
});
