"use client";

import { useState, useEffect, useCallback } from "react";
import { ActionState, fieldErrors } from "@/lib/create-safe-action";

type Action<TInput, TOutput> = (
  data: TInput
) => Promise<ActionState<TInput, TOutput>>;

interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

export const useAction = <TInput, TOutput>(
  action: Action<TInput, TOutput>,
  options: UseActionOptions<TOutput> = {}
) => {
  const [fieldErrors, setFieldErrors] = useState<
    fieldErrors<TInput> | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TOutput | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true);

      try {
        const result = await action(input);

        console.log("result", result);
        if (!result) return;

        if (result.fieldErrors) setFieldErrors(result.fieldErrors);

        if (result.error) {
          setError(result.error);
          options.onError?.(result.error);
        }

        if (result.data) {
          setError(undefined);
          setFieldErrors(undefined);

          setData(result.data);

          options.onSuccess?.(result.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        options.onComplete?.();
      }
    },
    [action, options]
  );

  return {
    execute,
    fieldErrors,
    error,
    data,
    isLoading,
  };
};