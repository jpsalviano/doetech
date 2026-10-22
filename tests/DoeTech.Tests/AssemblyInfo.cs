using Xunit;

// Cada classe tem a sua API e o seu banco, configurados por variáveis de
// ambiente do processo: em paralelo, uma fixture veria as da outra.
[assembly: CollectionBehavior(DisableTestParallelization = true)]
