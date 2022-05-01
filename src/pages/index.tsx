/* eslint-disable prettier/prettier */
import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

import { Card } from '../components/CardList';

interface fetchImagesResponse {
  data: Array<unknown>;
  after: number;
}

export default function Home(): JSX.Element {
  async function fetchImages({
    pageParam = null,
  }): Promise<fetchImagesResponse> {
    if (pageParam) {
      const { data } = await api.get(`/api/images`, {
        params: {
          after: pageParam,
        },
      });

      return data;
    }
    const { data } = await api.get(`/api/images`);
    return data;
  }


  const {
    data,
    isLoading,
    isFetched,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    'images',
    fetchImages, {
      getNextPageParam: lastPage => lastPage.after,
    }
  );

  const formattedData = useMemo(() => {
    // TODO FORMAT AND FLAT DATA ARRAY
    if(isFetched){
      const pages = data.pages.map((page) => {
        return page.data.map((card: Card): Card => {
          return {
            title: card.title,
            description: card.description,
            ts: card.ts,
            url: card.url,
            id: card.id
          }
        })
      });

      const mergedPages = [].concat(...pages);
      return mergedPages;
    }
  }, [data]);

  // TODO RENDER LOADING SCREEN
  if(isLoading){
    return(
      <Loading/>
    )
  }

  // TODO RENDER ERROR SCREEN
  if(isError){
    return(
      <Error/>
    )
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {/* TODO RENDER LOAD MORE BUTTON IF DATA HAS NEXT PAGE */}
        { hasNextPage &&
          <Button type="button" onClick={() => fetchNextPage()}>{isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}</Button>
        }
      </Box>
    </>
  );
}
