import { StyleSheet } from 'react-native';

export const metricsStyles = StyleSheet.create({
  containerMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'space-between',
    height: '15%',
  },
  metricsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    height: '25%',
  },
  basicWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsHeader: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  metricsText: {
    fontSize: 18,
  },
  bigHeader: {
    fontSize: 45,
  },
  bigPace: {
    width: '100%',
    height: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
