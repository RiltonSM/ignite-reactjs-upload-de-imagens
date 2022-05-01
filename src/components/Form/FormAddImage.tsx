/* eslint-disable prettier/prettier */
import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { AxiosResponse } from 'axios';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

interface MutationParam {
  url: string;
  title: string;
  description: string;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const maxFileSize = useMemo(() => {
    return 10 * 10**6; // 10 MB
  }, []);

  const allowFileTypes = useMemo(() => {
    return [
      'image/png',
      'image/jpeg',
      'image/gif',
    ]
  }, []);

  const formValidations = {
    image: {
      // TODO REQUIRED, LESS THAN 10 MB AND ACCEPTED FORMATS VALIDATIONS OK
      required: 'Arquivo obrigatório',
      validate: {
        lessThan10MB: (file) => {
          return file[0].size < maxFileSize || 'O arquivo deve ser menor que 10MB'
        },
        acceptedFormats: (file) => {
          return allowFileTypes.includes(file[0].type) || 'Somente são aceitos arquivos PNG, JPEG e GIF'
        }
      }
    },
    title: {
      // TODO REQUIRED, MIN AND MAX LENGTH VALIDATIONS OK
      required: 'Título obrigatório',
      minLength: {
        value: 2,
        message: 'Mínimo de 2 caracteres'
      },
      maxLength: {
        value: 20,
        message: 'Máximo de 20 caracteres'
      }
    },
    description: {
      // TODO REQUIRED, MAX LENGTH VALIDATIONS OK
      required: 'Descrição obrigatória',
      maxLength: {
        value: 65,
        message: 'Máximo de 65 caracteres'
      }
    },
  };
  
  const addImage = (formData: MutationParam): Promise<AxiosResponse> => {
    return api.post('/api/images', formData)
  }

  const queryClient = useQueryClient();
  const mutation = useMutation(
    // TODO MUTATION API POST REQUEST,
    addImage,
    {
      // TODO ONSUCCESS MUTATION
      // FAZER A INVALIDAÇÃO DA QUERY
      onSuccess: (data) => {
        queryClient.invalidateQueries('images')
      }
    }
  );


  const {
    register,
    handleSubmit,
    reset,
    formState,
    setError,
    trigger,
  } = useForm();
  const { errors } = formState;

  const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
    try {
      // TODO SHOW ERROR TOAST IF IMAGE URL DOES NOT EXISTS OK
      if(!imageUrl){
        toast({
          title: 'Imagem não adicionada',
          description: 'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.'
        });
      }
      // TODO EXECUTE ASYNC MUTATION
      mutation.mutateAsync({
        title: String(data.title),
        description: String(data.description),
        url: imageUrl
      })
      // TODO SHOW SUCCESS TOAST
      toast({
        title: 'Imagem cadastrada',
        description: 'Sua imagem foi cadastrada com sucesso.'
      })
    } catch {
      // TODO SHOW ERROR TOAST IF SUBMIT FAILED
      toast({
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.'
      })
    } finally {
      // TODO CLEAN FORM, STATES AND CLOSE MODAL
      reset();
      setImageUrl('');
      setLocalImageUrl('');
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          {...register('image', formValidations.image)}
          error={errors.image}
          // TODO SEND IMAGE ERRORS OK
          // TODO REGISTER IMAGE INPUT WITH VALIDATIONS OK
        />

        <TextInput
          placeholder="Título da imagem..."
          {...register('title', formValidations.title)}
          error={errors.title}
          // TODO SEND TITLE ERRORS OK
          // TODO REGISTER TITLE INPUT WITH VALIDATIONS OK
        />

        <TextInput
          placeholder="Descrição da imagem..."
          {...register('description', formValidations.description)}
          error={errors.description}
          // TODO SEND DESCRIPTION ERRORS OK
          // TODO REGISTER DESCRIPTION INPUT WITH VALIDATIONS OK
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
